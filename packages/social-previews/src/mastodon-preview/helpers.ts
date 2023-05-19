import { firstValid, hardTruncation, shortEnough, stripHtmlTags, Formatter } from '../helpers';

const TITLE_LENGTH = 200;
const DESCRIPTION_LENGTH = 1000;
const URL_LENGTH = 30;

export const mastodonTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const mastodonBody: Formatter = ( text ) =>
	firstValid(
		shortEnough( DESCRIPTION_LENGTH ),
		hardTruncation( DESCRIPTION_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const mastodonUrl: Formatter = ( text ) =>
	firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) )( stripHtmlTags( text ) ) ||
	'';
