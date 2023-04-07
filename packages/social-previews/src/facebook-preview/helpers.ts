import { firstValid, hardTruncation, shortEnough, stripHtmlTags } from '../helpers';
import { TextFormatter } from '../types';

const TITLE_LENGTH = 70;
const DESCRIPTION_LENGTH = 200;
const CUSTOM_TEXT_LENGTH = 63206;

export const baseDomain: TextFormatter = ( url ) =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

export const facebookTitle: TextFormatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) );

export const facebookDescription: TextFormatter = ( text ) =>
	firstValid(
		shortEnough( DESCRIPTION_LENGTH ),
		hardTruncation( DESCRIPTION_LENGTH )
	)( stripHtmlTags( text ) );

export const facebookCustomText: TextFormatter = ( text ) =>
	firstValid(
		shortEnough( CUSTOM_TEXT_LENGTH ),
		hardTruncation( CUSTOM_TEXT_LENGTH )
	)( stripHtmlTags( text ) );
