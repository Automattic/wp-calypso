import { isStartWritingFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';

interface Props {
	flow: string;
	siteSlug?: string;
	isFirstPostPublished?: boolean;
}

const useCelebrationData = ( { flow, siteSlug = '', isFirstPostPublished = false }: Props ) => {
	const translate = useTranslate();
	const isStartWritingFlowOrFirstPostPublished = isStartWritingFlow( flow ) || isFirstPostPublished;
	const defaultCelebrationData = {
		dashboardCtaName: 'Go to dashboard',
		dashboardCtaText: translate( 'Go to dashboard' ),
		dashboardCtaLink: `/home/${ siteSlug }`,
	};

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
