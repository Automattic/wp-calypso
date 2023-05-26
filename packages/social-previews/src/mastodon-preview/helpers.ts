import {
	firstValid,
	hardTruncation,
	shortEnough,
	stripHtmlTags,
	preparePreviewText,
	Formatter,
} from '../helpers';

const TITLE_LENGTH = 200;
const BODY_LENGTH = 500;
const URL_LENGTH = 30;

export const mastodonTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const mastodonBody = ( text: string, offset = 0 ) => {
	return preparePreviewText( text, {
		platform: 'mastodon',
		maxChars: BODY_LENGTH - URL_LENGTH - offset,
	} );
};

export const mastodonUrl: Formatter = ( text ) =>
	firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) )( stripHtmlTags( text ) ) ||
	'';
