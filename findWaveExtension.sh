#!/bin/bash
#
# findWaveExtension.sh
#
# Description:
# -------------
# This script locates the path of the unpacked WAVE Chrome extension on the local system.
# It identifies the user's operating system, checks common Chrome extension directories for the
# WAVE extension ID, and returns the path to the latest version of the extension.
#
# This path is used by other scripts (e.g., getWaveScores.js) to load the WAVE extension into a
# Puppeteer-controlled Chrome instance for accessibility testing.
#
# Supported Platforms:
# --------------------
# - macOS
# - Linux
# - Windows (via Git Bash, MSYS, or Cygwin)
#
# Usage:
# ------
#   ./findWaveExtension.sh
#
# Output:
# -------
#   /full/path/to/wave/extension/version/
#
# Notes:
# ------
# - This script assumes the WAVE extension has already been installed in Chrome.
# - It searches the Chrome "Default" profile only.
# - If the extension isn't found, the script exits with an error.
#
# License:
# --------
# This code is released under the MIT License on July 21, 2025 by Zoltan Hawryluk.
#

# WAVE extension ID (constant)
WAVE_ID="jbbplnpkjmmeebjpijfedlgcdilocofh"

# Determine OS and set base profile path
case "$OSTYPE" in
  darwin*)   BASE="$HOME/Library/Application Support/Google/Chrome/Default/Extensions" ;;
  linux*)    BASE="$HOME/.config/google-chrome/Default/Extensions" ;;
  msys*|cygwin*|win32)
             BASE="$(cmd.exe /c "echo %LOCALAPPDATA%" 2>/dev/null | tr -d '\r')/Google/Chrome/User Data/Default/Extensions"
             ;;
  *)
             echo "Unsupported OS: $OSTYPE"
             exit 1
             ;;
esac

EXT_PATH="$BASE/$WAVE_ID"

# Check if the path exists
if [ ! -d "$EXT_PATH" ]; then
  echo "WAVE extension not found at expected location: $EXT_PATH"
  exit 1
fi

# Find the latest version folder
LATEST_VERSION=$(ls "$EXT_PATH" | sort -Vr | head -n 1)
FULL_PATH="$EXT_PATH/$LATEST_VERSION"

# Output the full path
echo "$FULL_PATH"

