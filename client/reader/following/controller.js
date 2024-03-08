import page from '@automattic/calypso-router';
import { getQueryString } from '@wordpress/url';

export function followingManage() {
	const queryString = getQueryString( window.location.href );
	return page.redirect( '/read/subscriptions' + ( queryString ? '?' + queryString : '' ) );
}
