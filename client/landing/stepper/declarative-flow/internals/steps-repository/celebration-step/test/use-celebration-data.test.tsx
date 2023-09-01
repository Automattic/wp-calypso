import {
	DESIGN_FIRST_FLOW,
	START_WRITING_FLOW,
	WITH_THEME_ASSEMBLER_FLOW,
} from '@automattic/onboarding';
import useCelebrationData from '../use-celebration-data';

const siteSlug = 'testcelebrationscreen.wordpress.com';

describe( 'The useCelebrationData hook', () => {
	describe( `The ${ DESIGN_FIRST_FLOW } flow`, () => {
		const flow = DESIGN_FIRST_FLOW;

		it( 'renders correct texts and links when first post is NOT published', () => {
			const data = useCelebrationData( {
				flow,
				siteSlug,
				isFirstPostPublished: false,
			} );

			expect( data ).toEqual( {
				title: 'Your blog’s ready!',
				subTitle: 'Now it’s time to start posting.',
				primaryCtaName: 'Write your first post',
				primaryCtaText: 'Write your first post',
				primaryCtaLink: `/post/${ siteSlug }`,
				secondaryCtaName: 'Visit your blog',
				secondaryCtaText: 'Visit your blog',
				secondaryCtaLink: `https://${ siteSlug }`,
				dashboardCtaName: 'Go to dashboard',
				dashboardCtaText: 'Go to dashboard',
				dashboardCtaLink: `/home/${ siteSlug }`,
			} );
		} );

		it( 'renders correct texts and links when first post is published', () => {
			const data = useCelebrationData( {
				flow,
				siteSlug,
				isFirstPostPublished: true,
			} );

			expect( data ).toEqual( {
				title: 'Your blog’s ready!',
				subTitle: 'Now it’s time to connect your social accounts.',
				primaryCtaName: 'Connect to social',
				primaryCtaText: 'Connect to social',
				primaryCtaLink: `/marketing/connections/${ siteSlug }`,
				secondaryCtaName: 'Visit your blog',
				secondaryCtaText: 'Visit your blog',
				secondaryCtaLink: `https://${ siteSlug }`,
				dashboardCtaName: 'Go to dashboard',
				dashboardCtaText: 'Go to dashboard',
				dashboardCtaLink: `/home/${ siteSlug }`,
			} );
		} );
	} );

	describe( `The ${ START_WRITING_FLOW } flow`, () => {
		const flow = WITH_THEME_ASSEMBLER_FLOW;

		it( 'renders correct texts and links', () => {
			const data = useCelebrationData( {
				flow,
				siteSlug,
			} );

			expect( data ).toEqual( {
				title: 'Your blog’s ready!',
				subTitle: 'Now it’s time to connect your social accounts.',
				primaryCtaName: 'Connect to social',
				primaryCtaText: 'Connect to social',
				primaryCtaLink: `/marketing/connections/${ siteSlug }`,
				secondaryCtaName: 'Visit your blog',
				secondaryCtaText: 'Visit your blog',
				secondaryCtaLink: `https://${ siteSlug }`,
				dashboardCtaName: 'Go to dashboard',
				dashboardCtaText: 'Go to dashboard',
				dashboardCtaLink: `/home/${ siteSlug }`,
			} );
		} );
	} );

	describe( `The ${ WITH_THEME_ASSEMBLER_FLOW } flow`, () => {
		const flow = WITH_THEME_ASSEMBLER_FLOW;

		it( 'renders correct texts and links', () => {
			const data = useCelebrationData( {
				flow,
				siteSlug,
			} );

			expect( data ).toEqual( {
				title: 'Your site’s ready!',
				subTitle: 'Now it’s time to edit your content',
				primaryCtaName: 'Edit your content',
				primaryCtaText: 'Edit your content',
				primaryCtaLink: `/site-editor/${ siteSlug }?canvas=edit&assembler=1`,
				secondaryCtaName: 'Visit your site',
				secondaryCtaText: 'Visit your site',
				secondaryCtaLink: `https://${ siteSlug }`,
				dashboardCtaName: 'Go to dashboard',
				dashboardCtaText: 'Go to dashboard',
				dashboardCtaLink: `/home/${ siteSlug }`,
			} );
		} );
	} );
} );
