import { hasTag } from '../helpers';
import { facebookCustomText } from './helpers';

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
			<span
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: facebookCustomText( text, { allowedTags: [ 'a' ] } ) } }
			/>
			{ postLink }
		</p>
	);
};

export default CustomText;
