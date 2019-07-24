/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { isGutenbergSupported } from 'state/selectors/is-gutenberg-supported';

export const isGutenbergOptInEnabled = ( state, siteId ) => {
	return isGutenbergSupported( state, siteId ) && isEnabled( 'gutenberg/opt-in' );
};

export default isGutenbergOptInEnabled;
