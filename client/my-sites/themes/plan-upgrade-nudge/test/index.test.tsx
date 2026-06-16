/**
 * @jest-environment jsdom
 */
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import PlanUpgradeNudge from '../index';
import type { ComponentType, ReactNode } from 'react';

interface BannerProps {
	callToAction: string;
	description?: string;
	event: string;
	href: string;
	icon?: ReactNode;
	plan?: string;
	title?: string;
}

const mockBanner = jest.fn( ( { callToAction, event, href }: BannerProps ) => (
	<a data-event={ event } href={ href }>
		{ callToAction }
	</a>
) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	localize: ( Component: ComponentType ) => Component,
	translate: ( text: string ) => text,
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/components/banner', () => ( {
	__esModule: true,
	default: ( props: BannerProps ) => mockBanner( props ),
} ) );

const mockUseSelector = useSelector as jest.MockedFunction< typeof useSelector >;

describe( 'PlanUpgradeNudge', () => {
	beforeEach( () => {
		mockBanner.mockClear();
		mockUseSelector.mockReset();
	} );

	it.each( [
		[
			PLAN_FREE,
			'Upgrade to Personal',
			'/checkout/example-site/personal',
			'calypso_themeshowcase_personal_upgrade_nudge',
		],
		[
			PLAN_PERSONAL,
			'Upgrade to Premium',
			'/checkout/example-site/premium',
			'calypso_themeshowcase_premium_upgrade_nudge',
		],
		[
			PLAN_PREMIUM,
			'Upgrade to Business',
			'/checkout/example-site/business',
			'calypso_themeshowcase_business_upgrade_nudge',
		],
	] )(
		'renders the %s upgrade banner with the expected CTA, href, and event',
		( planSlug, callToAction, href, event ) => {
			mockUseSelector.mockReturnValue( planSlug );

			render( <PlanUpgradeNudge siteId={ 123 } siteSlug="example-site" /> );

			const cta = screen.getByRole( 'link', { name: callToAction } );

			expect( cta ).toHaveAttribute( 'href', href );
			expect( cta ).toHaveAttribute( 'data-event', event );
		}
	);
} );
