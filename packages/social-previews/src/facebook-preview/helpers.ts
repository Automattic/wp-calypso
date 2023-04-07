import { firstValid, hardTruncation, shortEnough } from '../helpers';
import { TextFormatter } from '../types';

const TITLE_LENGTH = 70;
const DESCRIPTION_LENGTH = 200;
const CUSTOM_TEXT_LENGTH = 63206;

export const baseDomain: TextFormatter = ( url ) =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

export const facebookTitle: TextFormatter = firstValid(
	shortEnough( TITLE_LENGTH ),
	hardTruncation( TITLE_LENGTH )
);

export const facebookDescription: TextFormatter = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export const facebookCustomText: TextFormatter = firstValid(
	shortEnough( CUSTOM_TEXT_LENGTH ),
	hardTruncation( CUSTOM_TEXT_LENGTH )
);
