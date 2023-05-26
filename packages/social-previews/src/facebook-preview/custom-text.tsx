import { hasTag, preparePreviewText } from '../helpers';
import { CUSTOM_TEXT_LENGTH } from './helpers';

type Props = {
	text: string;
	url: string;
	forceUrlDisplay?: boolean;
};

const CustomText: React.FC< Props > = ( { text, url, forceUrlDisplay } ) => {
	let postLink;

	if ( forceUrlDisplay || hasTag( text, 'a' ) ) {
		postLink = (
			<a
				className="facebook-preview__custom-text-post-url"
				href={ url }
				rel="nofollow noopener noreferrer"
				target="_blank"
			>
				{ url }
			</a>
		);
	}

	return (
		<p className="facebook-preview__custom-text">
			<span>
				{ preparePreviewText( text, {
					platform: 'facebook',
					maxChars: CUSTOM_TEXT_LENGTH,
				} ) }
			</span>
			{ postLink }
		</p>
	);
};

export default CustomText;
