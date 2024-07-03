GREEN='\033[1;32m'
NC='\033[0m' # No Color

echo "To mock WordPress.com locally:"

echo "  1. Add ${GREEN}127.0.0.1 wordpress.com${NC} to your hosts file."
echo "  2. Restart Calypso with ${GREEN}yarn start-mock-wordpress-com${NC}."
echo "  3. Type ${GREEN}thisisunsafe${NC} in Chrome when you visit wordpress.com."
