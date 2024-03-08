import { isEnabled } from '@automattic/calypso-config';

export const STORE_KEY = 'automattic/site';

export const getPlaceholderSiteID = () =>
	isEnabled( 'pattern-assembler/v2' )
		? '226011606' // assemblerdemo
		: '224076220'; // creatio2demo
