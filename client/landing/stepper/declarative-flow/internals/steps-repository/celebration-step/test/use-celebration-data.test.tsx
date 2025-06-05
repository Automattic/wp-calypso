/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { renderHook } from '@testing-library/react';
import defaultCalypsoI18n, { I18NContext } from 'i18n-calypso';
import useCelebrationData from '../use-celebration-data';

const siteSlug = 'testcelebrationscreen.wordpress.com';

describe( 'The useCelebrationData hook', () => {
	let wrapper;

	beforeEach( () => {
		wrapper = ( { children } ) => (
			<I18NContext.Provider value={ defaultCalypsoI18n }>{ children }</I18NContext.Provider>
		);
	} );

	describe( `The ${ START_WRITING_FLOW } flow`, () => {
		const flow = START_WRITING_FLOW;

		it( 'renders correct texts and links', () => {
			const { result } = renderHook(
				() =>
					useCelebrationData( {
						flow,
						siteSlug,
					} ),
				{ wrapper }
			);

			expect( result.current ).toEqual( {
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
} );
