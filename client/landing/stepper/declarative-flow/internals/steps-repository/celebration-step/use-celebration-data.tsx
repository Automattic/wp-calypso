import { isStartWritingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';

interface Props {
	flow: string;
	siteSlug?: string;
	isFirstPostPublished?: boolean;
	isLaunched?: boolean;
}

const useCelebrationData = ( {
	flow,
	siteSlug = '',
	isFirstPostPublished = false,
	isLaunched = false,
}: Props ) => {
	const translate = useTranslate();
	const isStartWritingFlowOrFirstPostPublished = isStartWritingFlow( flow ) || isFirstPostPublished;
	const defaultCelebrationData = {
		dashboardCtaName: 'Go to dashboard',
		dashboardCtaText: translate( 'Go to dashboard' ),
		dashboardCtaLink: `/home/${ siteSlug }`,
	};

	if ( isSiteAssemblerFlow( flow ) ) {
		const siteEditorParams = new URLSearchParams( { canvas: 'edit' } );

		return {
			...defaultCelebrationData,
			title: translate( 'Your site’s ready!' ),
			subTitle: isLaunched ? '' : translate( 'Now it’s time to edit your content' ),
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
