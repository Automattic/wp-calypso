import { preparePreviewText } from '../helpers';
import { TextProps } from './types';

export const Text: React.FC< TextProps > = ( { text, cardUrl } ) => {
	// If the text ends with the card URL, remove it.
	const deCardedText = text.endsWith( cardUrl )
		? text.substring( 0, text.lastIndexOf( cardUrl ) )
		: text;

	const __html = preparePreviewText( deCardedText, { platform: 'twitter' } );

	return (
		<div
			className="twitter-preview__text"
			// We can enable dangerouslySetInnerHTML here, since the text we're using is stripped
			// of all HTML tags, then only has safe tags added in createTweetMarkup().
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html } }
		/>
	);
};
