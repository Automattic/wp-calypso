import { isEnabled } from '@automattic/calypso-config';

export const STORE_KEY = 'automattic/site';

export const getPatternSourceSiteID = () =>
	isEnabled( 'pattern-assembler/v2' )
		? '226765597' // assemblerv2patterns
		: '174455321'; // dotcompatterns
