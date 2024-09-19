import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { baseDomain, getTitleFromDescription, stripHtmlTags } from '../../../helpers';
import { mastodonTitle } from '../../helpers';
import { MastodonPreviewProps } from '../../types';

import './styles.scss';

const MastodonPostCard: React.FC< MastodonPreviewProps > = ( {
	siteName,
	title,
	description,
	url,
	image,
	customImage,
} ) => {
	return (
		<div className={ clsx( 'mastodon-preview__card', { 'has-image': image } ) }>
			<div className="mastodon-preview__card-img">
				{ image || customImage ? (
					<img
						src={ image || customImage }
						alt={ __( 'Mastodon preview thumbnail', 'social-previews' ) }
					/>
				) : (
					<div className="mastodon-preview__card-img--fallback">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="24"
							viewBox="0 -960 960 960"
							width="24"
							aria-hidden="true"
						>
							<path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520h200L520-800v200Z"></path>
						</svg>
					</div>
				) }
			</div>
			<div className="mastodon-preview__card-text">
				<span className="mastodon-preview__card-site">{ siteName || baseDomain( url ) }</span>
				<span className="mastodon-preview__card-title">
					{ mastodonTitle( title ) || getTitleFromDescription( description ) }
				</span>
				<span className="mastodon-preview__card-description">{ stripHtmlTags( description ) }</span>
			</div>
		</div>
	);
};

export default MastodonPostCard;
