import { isStartWritingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';

interface Props {
	flow: string;
	siteSlug?: string;
	isFirstPostPublished?: boolean;
}

const useTranslations = ( { flow, siteSlug = '', isFirstPostPublished = false }: Props ) => {
	const translate = useTranslate();

	if ( isSiteAssemblerFlow( flow ) ) {
		const siteEditorParams = new URLSearchParams( {
			canvas: 'edit',
			assembler: '1',
		} );

		return {
			title: translate( 'Your site’s ready!' ),
			subTitle: translate( 'Now it’s time to edit your content' ),
			primaryCtaText: translate( 'Edit your content' ),
			primaryCtaLink: `/site-editor/${ siteSlug }?${ siteEditorParams }`,
			secondaryCtaText: translate( 'Visit your site' ),
			secondaryCtaLink: `https://${ siteSlug }`,
			dashboardText: translate( 'Go to dashboard' ),
			dashboardLink: `/home/${ siteSlug }`,
		};
	}

	return {
		title: translate( 'Your blog’s ready!' ),
		subTitle:
			isStartWritingFlow( flow ) || isFirstPostPublished
				? translate( 'Now it’s time to connect your social accounts.' )
				: translate( 'Now it’s time to start posting.' ),
		primaryCtaText:
			isStartWritingFlow( flow ) || isFirstPostPublished
				? translate( 'Connect to social' )
				: translate( 'Write your first post' ),
		primaryCtaLink:
			isStartWritingFlow( flow ) || isFirstPostPublished
				? `/marketing/connections/${ siteSlug }`
				: `/post/${ siteSlug }`,
		secondaryCtaText: translate( 'Visit your blog' ),
		secondaryCtaLink: `https://${ siteSlug }`,
		dashboardText: translate( 'Go to dashboard' ),
		dashboardLink: `/home/${ siteSlug }`,
	};
};

export default useTranslations;
