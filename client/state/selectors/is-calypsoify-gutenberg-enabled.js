/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import { abtest } from 'lib/abtest';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) =>
	siteId
		? isEnabled( 'gutenberg/opt-in' ) &&
		  ! isJetpackSite( state, siteId ) &&
		  ! isVipSite( state, siteId ) &&
		  'yes' === abtest( 'calypsoifyGutenberg' )
		: false;

export default isCalypsoifyGutenbergEnabled;
