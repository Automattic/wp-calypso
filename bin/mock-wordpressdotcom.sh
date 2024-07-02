if [ $# -eq 0 ]; then
    echo "Mocking WordPress.com locally"
    GREEN='\033[1;32m'
    NC='\033[0m' # No Color

    echo "Pulling files from ${GREEN}PR#91208${NC}"

    # This checks out loose files from a branch.
    git checkout origin/add/mock-wp.com -- client/server/boot/index.js
    git checkout origin/add/mock-wp.com -- config/development.json
    git checkout origin/add/mock-wp.com -- package.json
    git checkout origin/add/mock-wp.com -- yarn.lock

    echo "Installing dependencies..."

    yarn > /dev/null

    echo "Done!"

    echo "Make sure to:"
    echo "  1. Add ${GREEN}127.0.0.1 wordpress.com${NC} to your hosts file."
    echo "  2. Restart Calypso with ${GREEN}yarn start${NC}."
    echo "  3. Type ${GREEN}thisisunsafe${NC} in Chrome when you visit wordpress.com."
    echo "  4. Unmock when done by calling this script with ${GREEN}--unmock${NC}"
    echo "✨ Happy hacking!"
elif [ $1 == '--unmock' ]; then
    echo "Unmocking WordPress.com locally"
    git checkout trunk -- client/server/boot/index.js
    git checkout trunk -- config/development.json
    git checkout trunk -- package.json
    git checkout trunk -- yarn.lock

    echo "Done!"
    echo "Make sure to remove ${GREEN}127.0.0.1 wordpress.com${NC} to your hosts file."
fi

