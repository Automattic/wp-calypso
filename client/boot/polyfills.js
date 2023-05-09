import '@automattic/calypso-polyfills';

import localStoragePolyfill from 'calypso/lib/local-storage-polyfill';

// Only used in Calypso proper, so no need to turn into a package
// and add to calypso-polyfills for now.
localStoragePolyfill();
