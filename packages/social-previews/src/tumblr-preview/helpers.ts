import { firstValid, hardTruncation, shortEnough, stripHtmlTags, Formatter } from '../helpers';

const TITLE_LENGTH = 1000;
const DESCRIPTION_LENGTH = 400;

export const tumblrTitle: Formatter = ( text ) =>
	firstValid(
		shortEnough( TITLE_LENGTH ),
		hardTruncation( TITLE_LENGTH )
	)( stripHtmlTags( text ) ) || '';

export const tumblrDescription: Formatter = ( text ) => {
	// First remove Gutenberg block comments
	let processedText = text.replace( /<!--[\s\S]*?-->/g, '' );

	// Convert closing paragraph tags to line breaks to preserve paragraph structure
	processedText = processedText.replace( /<\/p>/g, '</p>\n\n' );

	return (
		firstValid(
			shortEnough( DESCRIPTION_LENGTH ),
			hardTruncation( DESCRIPTION_LENGTH )
		)( stripHtmlTags( processedText ) ) || ''
	);
};
