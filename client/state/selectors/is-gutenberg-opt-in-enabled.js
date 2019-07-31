/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isGutenbergSupported from 'state/selectors/is-gutenberg-supported';
import isVipSite from 'state/selectors/is-vip-site';

export const isGutenbergOptInEnabled = ( state, siteId ) => {
	return (
		isGutenbergSupported( state, siteId ) &&
		! isVipSite( state, siteId ) &&
		isEnabled( 'gutenberg/opt-in' )
	);
};

export default isGutenbergOptInEnabled;
