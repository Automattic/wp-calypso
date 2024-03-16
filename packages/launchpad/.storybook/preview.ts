import '@automattic/calypso-color-schemes';
import '@wordpress/components/build-style/style.css';
import { initialize, mswLoader } from 'msw-storybook-addon';
initialize();

export const loaders = [ mswLoader ];
