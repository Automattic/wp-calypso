import { MShotsImage } from '@automattic/onboarding';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

export const ReadymadeTemplatePreview = ( {
	readymadeTemplate,
}: {
	readymadeTemplate: ReadymadeTemplate;
} ) => {
	const mShotsOptions = {
		vpw: 1200,
		vph: 1680,
		w: 1200,
		screen_height: 1680,
	};

	return (
		<div className="readymade-template-preview">
			<MShotsImage
				url={ readymadeTemplate.previewUrl }
				alt=""
				options={ mShotsOptions }
				aria-labelledby=""
				loading="eager"
			/>
		</div>
	);
};
