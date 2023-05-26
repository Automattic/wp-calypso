import { stripHtmlTags, preparePreviewText } from '../../../helpers';
import { mastodonUrl, BODY_LENGTH, URL_LENGTH } from '../../helpers';
import type { MastodonPreviewProps } from '../../types';

import './styles.scss';

type Props = MastodonPreviewProps & { children?: React.ReactNode };

const body = ( text: string, offset = 0 ) => {
	return preparePreviewText( text, {
		platform: 'mastodon',
		maxChars: BODY_LENGTH - URL_LENGTH - offset,
	} );
};

const MastonPostBody: React.FC< Props > = ( props ) => {
	const { title, description, customText, url, children } = props;

	let bodyTxt;

	if ( customText ) {
		bodyTxt = <p>{ body( customText ) }</p>;
	} else if ( description ) {
		const renderedTitle = stripHtmlTags( title );

		bodyTxt = (
			<>
				<p>{ renderedTitle }</p>
				<p>{ body( description, renderedTitle.length ) }</p>
			</>
		);
	} else {
		bodyTxt = <p>{ body( title ) }</p>;
	}

	return (
		<div className="mastodon-preview__body">
			{ bodyTxt }
			<a href={ url } target="_blank" rel="noreferrer noopener">
				{ mastodonUrl( url.replace( /^https?:\/\//, '' ) ) }
			</a>
			{ children }
		</div>
	);
};

export default MastonPostBody;
