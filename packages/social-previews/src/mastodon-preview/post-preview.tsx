import { __ } from '@wordpress/i18n';
import { baseDomain } from '../helpers';
import { mastodonBody, mastodonUrl, mastodonTitle } from './helpers';
import MastodonPostActions from './post/actions';
import MastodonPostHeader from './post/header';
import type { MastodonPreviewProps } from './types';

import './styles.scss';

export const MastodonPostPreview: React.FC< MastodonPreviewProps > = ( {
	title,
	description,
	customText,
	user,
	url,
	image,
} ) => {
	let bodyTxt;

	if ( customText ) {
		bodyTxt = <p>{ mastodonBody( customText ) }</p>;
	} else {
		bodyTxt = (
			<>
				<p>{ mastodonTitle( title ) }</p>
				{ description && <p>{ mastodonBody( description ) }</p> }
			</>
		);
	}

	return (
		<div className="mastodon-preview__post">
			<MastodonPostHeader user={ user } />
			<div className="mastodon-preview__body">
				{ bodyTxt }
				<a href={ url } target="_blank" rel="noreferrer noopener">
					{ mastodonUrl( url.replace( /^https?:\/\//, '' ) ) }
				</a>
			</div>
			<div className="mastodon-preview__card">
				<div className="mastodon-preview__card-img">
					{ image && (
						<img src={ image } alt={ __( 'Mastodon preview thumbnail', 'social-previews' ) } />
					) }
				</div>
				<div className="mastodon-preview__card-text">
					<span className="mastodon-preview__card-title">{ mastodonTitle( title ) }</span>
					<span className="mastodon-preview__card-site">{ baseDomain( url ) }</span>
				</div>
			</div>

			<MastodonPostActions />
		</div>
	);
};
