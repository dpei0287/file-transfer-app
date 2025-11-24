#!/usr/bin/env python3
"""
transfer-iphone-media.py

Transfers media files from iPhone to Windows PC.
Copies all files from iPhone's Internal Storage (including subfolders) to a destination folder.

The iPhone must be connected and appear as a drive (e.g., "Apple iPhone\Internal Storage")

Usage:
    python transfer-iphone-media.py --source "\\Apple iPhone\Internal Storage" --destination "C:\Users\YourName\Pictures\iPhone_Backup"
    
    Or with optional filtering:
    python transfer-iphone-media.py --source "\\Apple iPhone\Internal Storage" --destination "C:\Backup" --file-types jpg,png,mp4,mov
"""

import os
import shutil
import argparse
import sys
from pathlib import Path
from datetime import datetime


def get_file_size_mb(size_bytes):
    """Convert bytes to megabytes for display."""
    return size_bytes / (1024 * 1024)


def is_media_file(filename, allowed_extensions=None):
    """
    Check if file is a media file based on extension.
    If allowed_extensions is None, all files are considered valid.
    """
    if allowed_extensions is None:
        return True
    
    ext = Path(filename).suffix.lower().lstrip('.')
    return ext in allowed_extensions


def copy_files_with_progress(source_path, dest_path, file_types=None):
    """
    Copy all files from source to destination, maintaining folder structure.
    
    Args:
        source_path: Source directory (iPhone Internal Storage path)
        dest_path: Destination directory on PC
        file_types: Optional list of file extensions to copy (e.g., ['jpg', 'png', 'mp4'])
    
    Returns:
        Dictionary with statistics about the transfer
    """
    stats = {
        'total_files': 0,
        'copied_files': 0,
        'skipped_files': 0,
        'failed_files': 0,
        'total_size_mb': 0,
        'errors': []
    }
    
    # Convert to Path objects
    source = Path(source_path)
    destination = Path(dest_path)
    
    # Validate source exists
    if not source.exists():
        raise FileNotFoundError(f"Source path does not exist: {source}")
    
    # Create destination if it doesn't exist
    destination.mkdir(parents=True, exist_ok=True)
    
    print(f"\n{'='*70}")
    print(f"Starting transfer from iPhone to PC")
    print(f"{'='*70}")
    print(f"Source:      {source}")
    print(f"Destination: {destination}")
    if file_types:
        print(f"File types:  {', '.join(file_types)}")
    else:
        print(f"File types:  All files")
    print(f"{'='*70}\n")
    
    # Walk through all directories and files
    for root, dirs, files in os.walk(source):
        root_path = Path(root)
        
        # Calculate relative path from source
        relative_path = root_path.relative_to(source)
        dest_dir = destination / relative_path
        
        # Create destination directory if it doesn't exist
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Process each file
        for filename in files:
            stats['total_files'] += 1
            source_file = root_path / filename
            dest_file = dest_dir / filename
            
            # Check if file type should be copied
            if not is_media_file(filename, file_types):
                stats['skipped_files'] += 1
                continue
            
            try:
                # Check if file already exists at destination
                if dest_file.exists():
                    # Compare file sizes to determine if we should skip
                    if source_file.stat().st_size == dest_file.stat().st_size:
                        print(f"⏭️  Skipping (exists): {relative_path / filename}")
                        stats['skipped_files'] += 1
                        continue
                
                # Copy the file
                file_size = source_file.stat().st_size
                file_size_mb = get_file_size_mb(file_size)
                
                print(f"📋 Copying: {relative_path / filename} ({file_size_mb:.2f} MB)")
                shutil.copy2(source_file, dest_file)
                
                stats['copied_files'] += 1
                stats['total_size_mb'] += file_size_mb
                
            except PermissionError as e:
                error_msg = f"Permission denied: {source_file}"
                print(f"❌ {error_msg}")
                stats['failed_files'] += 1
                stats['errors'].append(error_msg)
                
            except Exception as e:
                error_msg = f"Error copying {source_file}: {str(e)}"
                print(f"❌ {error_msg}")
                stats['failed_files'] += 1
                stats['errors'].append(error_msg)
    
    return stats


def print_summary(stats, start_time):
    """Print transfer summary statistics."""
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print(f"\n{'='*70}")
    print(f"Transfer Complete!")
    print(f"{'='*70}")
    print(f"Total files found:     {stats['total_files']}")
    print(f"Files copied:          {stats['copied_files']}")
    print(f"Files skipped:         {stats['skipped_files']}")
    print(f"Files failed:          {stats['failed_files']}")
    print(f"Total size copied:     {stats['total_size_mb']:.2f} MB")
    print(f"Duration:              {duration:.2f} seconds")
    
    if stats['total_size_mb'] > 0 and duration > 0:
        speed = stats['total_size_mb'] / duration
        print(f"Average speed:         {speed:.2f} MB/s")
    
    print(f"{'='*70}")
    
    if stats['errors']:
        print(f"\n⚠️  Errors encountered ({len(stats['errors'])}):")
        for error in stats['errors'][:10]:  # Show first 10 errors
            print(f"   - {error}")
        if len(stats['errors']) > 10:
            print(f"   ... and {len(stats['errors']) - 10} more errors")


def main():
    parser = argparse.ArgumentParser(
        description="Transfer media files from iPhone to Windows PC",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Copy all files from iPhone to PC
  python transfer-iphone-media.py --source "\\\\Apple iPhone\\Internal Storage" --destination "C:\\Backup\\iPhone"
  
  # Copy only specific media types
  python transfer-iphone-media.py --source "\\\\Apple iPhone\\Internal Storage" --destination "C:\\Photos" --file-types jpg,png,heic
  
  # Copy videos only
  python transfer-iphone-media.py --source "\\\\Apple iPhone\\Internal Storage\\202507_b" --destination "D:\\Videos" --file-types mp4,mov,avi

Common file types:
  Images: jpg, jpeg, png, heic, gif, bmp
  Videos: mp4, mov, avi, mkv, wmv
  """
    )
    
    parser.add_argument(
        "--source",
        required=True,
        help='Source path on iPhone (e.g., "\\\\Apple iPhone\\Internal Storage" or "This PC\\Apple iPhone\\Internal Storage")'
    )
    
    parser.add_argument(
        "--destination",
        required=True,
        help='Destination folder on PC (e.g., "C:\\Users\\YourName\\Pictures\\iPhone_Backup")'
    )
    
    parser.add_argument(
        "--file-types",
        help='Comma-separated list of file extensions to copy (e.g., "jpg,png,mp4,mov"). If not specified, all files are copied.'
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be copied without actually copying files"
    )
    
    args = parser.parse_args()
    
    # Parse file types if provided
    file_types = None
    if args.file_types:
        file_types = [ext.strip().lower() for ext in args.file_types.split(',')]
        print(f"Filtering for file types: {', '.join(file_types)}")
    
    # Show warning for dry run
    if args.dry_run:
        print("\n⚠️  DRY RUN MODE - No files will be copied\n")
    
    try:
        start_time = datetime.now()
        
        if args.dry_run:
            print("This is a dry run. No files will be copied.")
            # For dry run, we would scan but not copy
            # You could implement a scan-only mode here
            print(f"\nWould copy from: {args.source}")
            print(f"Would copy to:   {args.destination}")
            return
        
        # Perform the transfer
        stats = copy_files_with_progress(args.source, args.destination, file_types)
        
        # Print summary
        print_summary(stats, start_time)
        
        # Exit with error code if there were failures
        if stats['failed_files'] > 0:
            sys.exit(1)
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        print(f"\nMake sure your iPhone is connected and unlocked.", file=sys.stderr)
        print(f"The iPhone should appear in File Explorer as 'Apple iPhone'", file=sys.stderr)
        sys.exit(2)
        
    except KeyboardInterrupt:
        print(f"\n\n⚠️  Transfer interrupted by user", file=sys.stderr)
        sys.exit(130)
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}", file=sys.stderr)
        sys.exit(3)


if __name__ == "__main__":
    main()
