import { stripHtmlTags } from '../../../helpers';
import { getMastodonAddressDetails, mastodonBody, mastodonUrl } from '../../helpers';
import type { MastodonPreviewProps } from '../../types';

import './styles.scss';

type Props = MastodonPreviewProps & { children?: React.ReactNode };

const MastonPostBody: React.FC< Props > = ( props ) => {
	const { title, description, customText, url, user, children } = props;
	const instance = user?.address ? getMastodonAddressDetails( user.address ).instance : '';
	const options = {
		instance,
		offset: 0,
	};

	let bodyTxt;

	if ( customText ) {
		bodyTxt = <p>{ mastodonBody( customText, options ) }</p>;
	} else if ( description ) {
		if ( title ) {
			const renderedTitle = stripHtmlTags( title );

			options.offset = renderedTitle.length;

			bodyTxt = (
				<>
					<p>{ renderedTitle }</p>
					<p>{ mastodonBody( description, options ) }</p>
				</>
			);
		} else {
			bodyTxt = <p>{ mastodonBody( description, options ) }</p>;
		}
	} else {
		bodyTxt = <p>{ mastodonBody( title, options ) }</p>;
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
