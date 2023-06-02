import { PORTRAIT_MODE } from '../constants';
import CustomText from './custom-text';
import useImage from './hooks/use-image-hook';
import FacebookPostActions from './post/actions';
import FacebookPostHeader from './post/header';
import type { FacebookPreviewProps } from './types';

import './style.scss';

export const FacebookPostPreview: React.FC< FacebookPreviewProps > = ( {
	url,
	user,
	customText,
	media,
	imageMode,
} ) => {
	const [ mode ] = useImage( { mode: imageMode } );
	const modeClass = `is-${ mode === PORTRAIT_MODE ? 'portrait' : 'landscape' }`;

	return (
		<div className="facebook-preview__post">
			<FacebookPostHeader user={ user } />
			<div className="facebook-preview__content">
				{ customText && <CustomText text={ customText } url={ url } forceUrlDisplay /> }
				<div className="facebook-preview__body">
					{ media ? (
						<div className={ `facebook-preview__media ${ modeClass }` }>
							{ media.map( ( mediaItem, index ) => (
								<div
									key={ `facebook-preview__media-item-${ index }` }
									className={ `facebook-preview__media-item ${ modeClass }` }
								>
									{ mediaItem.type.startsWith( 'video/' ) ? (
										// eslint-disable-next-line jsx-a11y/media-has-caption
										<video controls>
											<source src={ mediaItem.url } type={ mediaItem.type } />
										</video>
									) : (
										<img alt={ mediaItem.alt || '' } src={ mediaItem.url } />
									) }
								</div>
							) ) }
						</div>
					) : null }
				</div>
			</div>
			<FacebookPostActions />
		</div>
	);
};
