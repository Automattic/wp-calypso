import {
	firstValid,
	hardTruncation,
	shortEnough,
	stripHtmlTags,
	preparePreviewText,
	Formatter,
} from '../helpers';
import { DEFAULT_MASTODON_INSTANCE } from './constants';
import { MastodonAddressDetails } from './types';

const TITLE_LENGTH = 200;
const BODY_LENGTH = 500;
const URL_LENGTH = 30;

const ADDRESS_PATTERN = /^@([^@]*)@([^@]*)$/i;

export const mastodonTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const mastodonBody = ( text: string, options: { offset: number; instance: string } ) => {
	const { instance, offset } = options;

	return preparePreviewText( text, {
		platform: 'mastodon',
		maxChars: BODY_LENGTH - URL_LENGTH - offset,
		hashtagDomain: instance,
	} );
};

export const mastodonUrl: Formatter = ( text ) =>
	firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) )( stripHtmlTags( text ) ) ||
	'';

export const getMastodonAddressDetails = ( address: string ): MastodonAddressDetails => {
	const matches = address.match( ADDRESS_PATTERN );

	return {
		username: matches?.[ 1 ] || '',
		instance: matches?.[ 2 ] || DEFAULT_MASTODON_INSTANCE,
	};
};
