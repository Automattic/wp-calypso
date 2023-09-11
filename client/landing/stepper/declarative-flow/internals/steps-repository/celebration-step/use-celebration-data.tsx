import { isAssemblerDesign } from '@automattic/design-picker';
import { isStartWritingFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { ONBOARD_STORE } from '../../../../stores';
import type { OnboardSelect } from '@automattic/data-stores';

interface Props {
	flow: string;
	siteSlug?: string;
	isFirstPostPublished?: boolean;
}

const useCelebrationData = ( { flow, siteSlug = '', isFirstPostPublished = false }: Props ) => {
	const translate = useTranslate();
	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);
	const isStartWritingFlowOrFirstPostPublished = isStartWritingFlow( flow ) || isFirstPostPublished;
	const defaultCelebrationData = {
		dashboardCtaName: 'Go to dashboard',
		dashboardCtaText: translate( 'Go to dashboard' ),
		dashboardCtaLink: `/home/${ siteSlug }`,
	};

	if ( isAssemblerDesign( selectedDesign ) ) {
		const siteEditorParams = new URLSearchParams( {
			canvas: 'edit',
			assembler: '1',
		} );

		return {
			...defaultCelebrationData,
			title: translate( 'Your site’s ready!' ),
			subTitle: translate( 'Now it’s time to edit your content' ),
			primaryCtaName: 'Edit your content',
			primaryCtaText: translate( 'Edit your content' ),
			primaryCtaLink: `/site-editor/${ siteSlug }?${ siteEditorParams }`,
			secondaryCtaName: 'Visit your site',
			secondaryCtaText: translate( 'Visit your site' ),
			secondaryCtaLink: `https://${ siteSlug }`,
		};
	}

	return {
		...defaultCelebrationData,
		title: translate( 'Your blog’s ready!' ),
		subTitle: isStartWritingFlowOrFirstPostPublished
			? translate( 'Now it’s time to connect your social accounts.' )
			: translate( 'Now it’s time to start posting.' ),
		primaryCtaName: isStartWritingFlowOrFirstPostPublished
			? 'Connect to social'
			: 'Write your first post',
		primaryCtaText: isStartWritingFlowOrFirstPostPublished
			? translate( 'Connect to social' )
			: translate( 'Write your first post' ),
		primaryCtaLink: isStartWritingFlowOrFirstPostPublished
			? `/marketing/connections/${ siteSlug }`
			: `/post/${ siteSlug }`,
		secondaryCtaName: 'Visit your blog',
		secondaryCtaText: translate( 'Visit your blog' ),
		secondaryCtaLink: `https://${ siteSlug }`,
	};
};

export default useCelebrationData;
