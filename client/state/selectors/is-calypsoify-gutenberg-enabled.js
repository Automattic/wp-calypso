/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) =>
	siteId
		? isEnabled( 'calypsoify/gutenberg' ) &&
		  ! isJetpackSite( state, siteId ) &&
		  ! isVipSite( state, siteId )
		: false;

export default isCalypsoifyGutenbergEnabled;
