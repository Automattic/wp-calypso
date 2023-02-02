cd apps/happy-blocks

# Copy existing dist files to release directory
mkdir apps/happy-blocks/release-files
cp -r apps/happy-blocks/dist apps/happy-blocks/release-files/dist/

# Add index.php file
cp apps/happy-blocks/index.php apps/happy-blocks/release-files/
