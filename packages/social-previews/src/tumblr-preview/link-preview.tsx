import { __ } from '@wordpress/i18n';
import { tumblrTitle, tumblrDescription } from './helpers';
import TumblrPostActions from './post/actions';
import TumblrPostHeader from './post/header';
import type { TumblrPreviewProps } from './types';

import './styles.scss';

const TumblrLinkPreview: React.FC< TumblrPreviewProps > = ( {
	title,
	description,
	image,
	user,
	url,
	customText,
	readOnly,
} ) => {
	const avatarUrl = user?.avatarUrl;

	return (
		<div className="tumblr-preview__post">
			{ avatarUrl && <img className="tumblr-preview__avatar" src={ avatarUrl } alt="" /> }
			<div className="tumblr-preview__card">
				<TumblrPostHeader user={ user } readOnly={ readOnly } />
				<div className="tumblr-preview__body">
					<div className="tumblr-preview__title">{ tumblrTitle( title ) }</div>
					{ customText && <div className="tumblr-preview__custom-text">{ customText }</div> }
					{ description && (
						<div className="tumblr-preview__description">{ tumblrDescription( description ) }</div>
					) }
					{ image && (
						<img
							className="tumblr-preview__image"
							src={ image }
							alt={ __( 'Tumblr preview thumbnail', 'tumblr-preview' ) }
						/>
					) }
					<a className="tumblr-preview__url" href={ url } target="_blank" rel="noreferrer">
						{ __( 'View On WordPress', 'tumblr-preview' ) }
					</a>
				</div>
				<TumblrPostActions readOnly={ readOnly } />
			</div>
		</div>
	);
};

export default TumblrLinkPreview;
