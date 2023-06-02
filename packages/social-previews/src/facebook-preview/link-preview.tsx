import { __ } from '@wordpress/i18n';
import { TYPE_ARTICLE, PORTRAIT_MODE } from '../constants';
import CustomText from './custom-text';
import { baseDomain, facebookTitle, facebookDescription } from './helpers';
import useImage from './hooks/use-image-hook';
import FacebookPostActions from './post/actions';
import FacebookPostHeader from './post/header';
import FacebookPostIcon from './post/icons';
import type { FacebookPreviewProps } from './types';

import './style.scss';

export type FacebookLinkPreviewProps = FacebookPreviewProps & {
	compactDescription?: boolean;
};

export const FacebookLinkPreview: React.FC< FacebookLinkPreviewProps > = ( {
	url,
	title,
	description,
	image,
	user,
	customText,
	type,
	imageMode,
	compactDescription,
} ) => {
	const [ mode, isLoadingImage, imgProps ] = useImage( { mode: imageMode } );
	const isArticle = type === TYPE_ARTICLE;
	const portraitMode = ( isArticle && ! image ) || mode === PORTRAIT_MODE;
	const modeClass = `is-${ portraitMode ? 'portrait' : 'landscape' }`;

	return (
		<div className="facebook-preview__post">
			<FacebookPostHeader user={ user } />
			<div className="facebook-preview__content">
				{ customText && <CustomText text={ customText } url={ url } /> }
				<div
					className={ `facebook-preview__body ${ modeClass } ${
						image && isLoadingImage ? 'is-loading' : ''
					}` }
				>
					{ ( image || isArticle ) && (
						<div
							className={ `facebook-preview__image ${ image ? '' : 'is-empty' } ${ modeClass }` }
						>
							{ /* eslint-disable jsx-a11y/alt-text */ }
							{ image && <img src={ image } { ...imgProps } /> }
						</div>
					) }
					<div className="facebook-preview__text">
						<div className="facebook-preview__text-wrapper">
							<div className="facebook-preview__url">{ baseDomain( url ) }</div>
							<div className="facebook-preview__title">
								{ facebookTitle( title ) || baseDomain( url ) }
							</div>
							<div
								className={ `facebook-preview__description ${
									compactDescription ? 'is-compact' : ''
								}` }
							>
								{ description && facebookDescription( description ) }
								{ isArticle &&
									! description &&
									// translators: Default description for a Facebook post
									__( 'Visit the post for more.', 'social-previews' ) }
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
