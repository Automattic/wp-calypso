import { firstValid, hardTruncation, shortEnough, stripHtmlTags, Formatter } from '../helpers';

const TITLE_LENGTH = 200;
const BODY_LENGTH = 500;
const URL_LENGTH = 30;

export const mastodonTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const mastodonBody: Formatter = ( text, offset = 0 ) =>
	firstValid(
		shortEnough( BODY_LENGTH - URL_LENGTH - offset ),
		hardTruncation( BODY_LENGTH - URL_LENGTH - offset )
	)( stripHtmlTags( text ) ) || '';

export const mastodonUrl: Formatter = ( text ) =>
	firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) )( stripHtmlTags( text ) ) ||
	'';
