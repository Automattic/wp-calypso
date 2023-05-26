import { stripHtmlTags } from '../../../helpers';
import { mastodonBody, mastodonUrl } from '../../helpers';
import type { MastodonPreviewProps } from '../../types';

import './styles.scss';

type Props = MastodonPreviewProps & { children?: React.ReactNode };

const MastonPostBody: React.FC< Props > = ( props ) => {
	const { title, description, customText, url, children } = props;

	let bodyTxt;

	if ( customText ) {
		bodyTxt = <p>{ mastodonBody( customText ) }</p>;
	} else if ( description ) {
		const renderedTitle = stripHtmlTags( title );

		bodyTxt = (
			<>
				<p>{ renderedTitle }</p>
				<p>{ mastodonBody( description, renderedTitle.length ) }</p>
			</>
		);
	} else {
		bodyTxt = <p>{ mastodonBody( title ) }</p>;
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
