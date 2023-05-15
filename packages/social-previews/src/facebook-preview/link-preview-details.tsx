import { PORTRAIT_MODE } from '../constants';
import CustomText from './custom-text';
import useImage from './hooks/use-image-hook';
import FacebookPostActions from './post/actions';
import FacebookPostHeader from './post/header';
import type { FacebookPreviewProps } from './types';

export const LinkPreviewDetails: React.FC< FacebookPreviewProps > = ( {
	url,
	customImage,
	user,
	customText,
	imageMode,
} ) => {
	const [ mode, isLoadingImage, imgProps ] = useImage( { mode: imageMode } );
	const modeClass = `is-${ mode === PORTRAIT_MODE ? 'portrait' : 'landscape' }`;

	return (
		<div className="facebook-preview__post">
			<FacebookPostHeader user={ undefined } />
			<div className="facebook-preview__content">
				<div
					className={ `facebook-preview__window ${ modeClass } ${
						customImage && isLoadingImage ? 'is-loading' : ''
					}` }
				>
					<div className={ `facebook-preview__custom-image ${ modeClass }` }>
						{ /* eslint-disable jsx-a11y/alt-text */ }
						<img src={ customImage } { ...imgProps } />
					</div>
					<FacebookPostHeader user={ user } timeElapsed hideOptions />
					{ customText && <CustomText text={ customText } url={ url } forceUrlDisplay /> }
				</div>
			</div>
			<FacebookPostActions />
		</div>
	);
};
