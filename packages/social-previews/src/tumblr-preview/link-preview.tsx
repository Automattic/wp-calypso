import { __ } from '@wordpress/i18n';
import { baseDomain } from '../helpers';
import { tumblrTitle, tumblrDescription } from './helpers';
import TumblrPostActions from './post/actions';
import TumblrPostHeader from './post/header';
import type { TumblrPreviewProps } from './types';

import './styles.scss';

export const TumblrLinkPreview: React.FC< TumblrPreviewProps > = ( {
	title,
	description,
	image,
	user,
	url,
} ) => {
	const avatarUrl = user?.avatarUrl;

	return (
		<div className="tumblr-preview__post">
			{ avatarUrl && <img className="tumblr-preview__avatar" src={ avatarUrl } alt="" /> }
			<div className="tumblr-preview__card">
				<TumblrPostHeader user={ user } />
				<div className="tumblr-preview__window">
					{ image && (
						<div className="tumblr-preview__window-top">
							<div className="tumblr-preview__overlay">
								<div className="tumblr-preview__title">{ tumblrTitle( title ) }</div>
							</div>

							<img
								className="tumblr-preview__image"
								src={ image }
								alt={ __( 'Tumblr preview thumbnail', 'social-previews' ) }
							/>
						</div>
					) }
					<div className={ `tumblr-preview__window-bottom ${ ! image ? 'is-full' : '' }` }>
						{ ! image && <div className="tumblr-preview__title">{ tumblrTitle( title ) }</div> }
						{ description && image && (
							<div className="tumblr-preview__description">
								{ tumblrDescription( description ) }
							</div>
						) }
						{ url && <div className="tumblr-preview__site-name">{ baseDomain( url ) }</div> }
					</div>
				</div>
				<TumblrPostActions />
			</div>
		</div>
	);
};
