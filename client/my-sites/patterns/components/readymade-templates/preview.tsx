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
		<MShotsImage url={ readymadeTemplate.previewUrl + '&t=2' } alt="" options={ mShotsOptions } />
	);
};
