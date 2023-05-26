import { firstValid, hardTruncation, shortEnough, stripHtmlTags, Formatter } from '../helpers';

export const TITLE_LENGTH = 200;
export const BODY_LENGTH = 500;
export const URL_LENGTH = 30;

export const mastodonTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const mastodonUrl: Formatter = ( text ) =>
	firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) )( stripHtmlTags( text ) ) ||
	'';
