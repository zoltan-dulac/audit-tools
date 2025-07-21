#!/bin/bash

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

