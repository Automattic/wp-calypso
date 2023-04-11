import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { TYPE_ARTICLE } from '../constants';
import { baseDomain, facebookTitle, facebookDescription, facebookCustomText } from './helpers';
import FacebookPostActions from './post/actions';
import FacebookPostHeader from './post/header';
import FacebookPostIcon from './post/icons';
import type { FacebookPreviewProps } from './types';

const LANDSCAPE_MODE = 'landscape';
const PORTRAIT_MODE = 'portrait';

const FacebookLinkPreview: React.FC< FacebookPreviewProps > = ( {
	url,
	title,
	description,
	image,
	user,
	customText,
	type,
} ) => {
	const [ mode, setMode ] = useState( LANDSCAPE_MODE );
	const isArticle = type === TYPE_ARTICLE;
	const portraitMode = ( isArticle && ! image ) || mode === PORTRAIT_MODE;

	const getModeClass = useCallback(
		() => `is-${ portraitMode ? 'portrait' : 'landscape' }`,
		[ portraitMode ]
	);
	const handleImageLoad = useCallback(
		( { target } ) =>
			setMode( target.naturalWidth > target.naturalHeight ? LANDSCAPE_MODE : PORTRAIT_MODE ),
		[ setMode ]
	);

	return (
		<div className="facebook-preview__post">
			<FacebookPostHeader user={ user } />
			<div className="facebook-preview__content">
				{ customText && (
					<p className="facebook-preview__custom-text">{ facebookCustomText( customText ) }</p>
				) }
				<div className={ `facebook-preview__body ${ getModeClass() }` }>
					{ ( image || isArticle ) && (
						<div
							className={ `facebook-preview__image ${
								image ? '' : 'is-empty'
							} ${ getModeClass() }` }
						>
							{ image && (
								<img
									alt={ __( 'Facebook Preview Thumbnail' ) }
									src={ image }
									onLoad={ handleImageLoad }
								/>
							) }
						</div>
					) }
					<div className="facebook-preview__text">
						<div>
							<div className="facebook-preview__url">{ baseDomain( url ) }</div>
							<div className="facebook-preview__title">
								{ facebookTitle( title ) || baseDomain( url ) }
							</div>
							<div className="facebook-preview__description">
								{ description && facebookDescription( description ) }
								{ isArticle &&
									! description &&
									// translators: Default description for a Facebook post
									__( 'Visit the post for more.' ) }
							</div>
							<div className="facebook-preview__info">
								<FacebookPostIcon name="info" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<FacebookPostActions />
		</div>
	);
};

export default FacebookLinkPreview;
