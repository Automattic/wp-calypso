import { PORTRAIT_MODE } from '../constants';
import CustomText from './custom-text';
import useImage from './hooks/use-image-hook';
import FacebookPostActions from './post/actions';
import FacebookPostHeader from './post/header';
import type { FacebookPreviewProps } from './types';

const FacebookPostPreview: React.FC< FacebookPreviewProps > = ( {
	url,
	user,
	customText,
	customImage,
	imageMode,
} ) => {
	const [ mode, isLoadingImage, imgProps ] = useImage( imageMode );
	const modeClass = `is-${ mode === PORTRAIT_MODE ? 'portrait' : 'landscape' }`;

	return (
		<div className="facebook-preview__post">
			<FacebookPostHeader user={ user } />
			<div className="facebook-preview__content">
				{ customText && <CustomText text={ customText } url={ url } forceUrlDisplay /> }
				<div className={ `facebook-preview__body ${ isLoadingImage ? 'is-loading' : '' }` }>
					<div className={ `facebook-preview__custom-image ${ modeClass }` }>
						{ /* eslint-disable jsx-a11y/alt-text */ }
						<img src={ customImage } { ...imgProps } />
					</div>
				</div>
			</div>
			<FacebookPostActions />
		</div>
	);
};

export default FacebookPostPreview;
