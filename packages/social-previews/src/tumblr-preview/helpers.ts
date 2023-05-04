import { firstValid, hardTruncation, shortEnough, stripHtmlTags, Formatter } from '../helpers';

const TITLE_LENGTH = 1000;
const DESCRIPTION_LENGTH = 400;

export const tumblrTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const tumblrDescription: Formatter = ( text ) =>
	firstValid(
		shortEnough( DESCRIPTION_LENGTH ),
		hardTruncation( DESCRIPTION_LENGTH )
	)( stripHtmlTags( text ) ) || '';
