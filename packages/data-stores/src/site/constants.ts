import { isEnabled } from '@automattic/calypso-config';

export const STORE_KEY = 'automattic/site';

export const PLACEHOLDER_SITE_ID = isEnabled( 'pattern-assembler/v2' )
	? 226011606 // assemblerdemo.wordpress.com
	: 224076220; // creatio2demo.wordpress.com

export const getPlaceholderSiteID = () =>
	isEnabled( 'pattern-assembler/v2' )
		? '226011606' // assemblerdemo
		: '224076220'; // creatio2demo
