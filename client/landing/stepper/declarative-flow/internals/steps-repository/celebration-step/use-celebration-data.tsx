import { useTranslate } from 'i18n-calypso';

interface Props {
	flow: string;
	siteSlug?: string;
	isFirstPostPublished?: boolean;
}

const useCelebrationData = ( { siteSlug = '', isFirstPostPublished = false }: Props ) => {
	const translate = useTranslate();
	const defaultCelebrationData = {
		dashboardCtaName: 'Go to dashboard',
		dashboardCtaText: translate( 'Go to dashboard' ),
		dashboardCtaLink: `/home/${ siteSlug }`,
	};

	return {
		...defaultCelebrationData,
		title: translate( 'Your blog’s ready!' ),
		subTitle: isFirstPostPublished
			? translate( 'Now it’s time to connect your social accounts.' )
			: translate( 'Now it’s time to start posting.' ),
		primaryCtaName: isFirstPostPublished ? 'Connect to social' : 'Write your first post',
		primaryCtaText: isFirstPostPublished
			? translate( 'Connect to social' )
			: translate( 'Write your first post' ),
		primaryCtaLink: isFirstPostPublished
			? `https://${ siteSlug }/wp-admin/admin.php?page=jetpack-social`
			: `/post/${ siteSlug }`,
		secondaryCtaName: 'Visit your blog',
		secondaryCtaText: translate( 'Visit your blog' ),
		secondaryCtaLink: `https://${ siteSlug }`,
	};
};

export default useCelebrationData;
