import { preparePreviewText } from '../helpers';
import { TextProps } from './types';

export const Text: React.FC< TextProps > = ( { text, url, retainUrl } ) => {
	if ( ! text ) {
		return null;
	}
	// If the text ends with the card URL, remove it.
	const tweetText =
		url && ! retainUrl && text.endsWith( url )
			? text.substring( 0, text.lastIndexOf( url ) )
			: text;

	return (
		<div className="twitter-preview__text">
			{ preparePreviewText( tweetText, { platform: 'twitter' } ) }
		</div>
	);
};
