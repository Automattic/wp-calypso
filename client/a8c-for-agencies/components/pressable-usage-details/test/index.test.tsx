/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import { APIProductFamilyProductBundlePrice } from 'calypso/a8c-for-agencies/types/products';
import PressableUsageDetails from '../index';

jest.mock( '@automattic/components', () => ( {
	ProgressBar: ( { className }: { className?: string } ) => (
		<div className={ className } data-testid="pressable-usage-progress-bar" />
	),
} ) );

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn(),
} ) );

jest.mock( 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses', () => jest.fn() );

const mockUseSelector = jest.mocked( useSelector );
const mockUseTranslate = jest.mocked( useTranslate );
const mockUseFetchLicenses = jest.mocked( useFetchLicenses );

const existingPlan = {
	slug: 'pressable-wp-1',
	name: 'Pressable WP 1',
	product_id: 1,
	currency: 'USD',
	amount: '0',
	interval: '1 year' as const,
	bill_period: 'yearly' as const,
	price_interval: 'yearly' as const,
	family_slug: 'pressable-wp',
	supported_bundles: [] as APIProductFamilyProductBundlePrice[],
};

function translateWithArgs(
	text: string,
	options?: { args?: Record< string, string | number > }
): string {
	if ( ! options?.args ) {
		return text;
	}

	return Object.entries( options.args ).reduce(
		( translatedText, [ key, value ] ) =>
			translatedText.replaceAll( `%(${ key })s`, String( value ) ),
		text
	) as unknown as string;
}

function createState( agencyOverrides: Record< string, unknown > = {} ) {
	return {
		a8cForAgencies: {
			agencies: {
				activeAgency: {
					third_party: {
						pressable: {
							usage: {
								storage_gb: 0,
								visits_count: 0,
								sites_count: 0,
							},
							titan_usage: {
								orders: [],
							},
						},
					},
					...agencyOverrides,
				},
			},
		},
	};
}

describe( 'PressableUsageDetails', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseTranslate.mockReturnValue(
			translateWithArgs as unknown as ReturnType< typeof useTranslate >
		);
		mockUseFetchLicenses.mockReturnValue( {
			data: {
				items: [],
			},
		} as unknown as ReturnType< typeof useFetchLicenses > );
	} );

	it.each( [
		{
			name: 'storage',
			usage: {
				storage_gb: 21,
				visits_count: 1000,
				sites_count: 1,
			},
			expectedWarning:
				'Over the limit. Purchase Pressable Storage add-ons to avoid issues with your agency sites.',
		},
		{
			name: 'visits',
			usage: {
				storage_gb: 10,
				visits_count: 50001,
				sites_count: 1,
			},
			expectedWarning:
				'Over the limit. Purchase Pressable Visits add-ons to avoid issues with your agency sites.',
		},
	] )( 'renders the add-ons CTA for $name overages', ( { usage, expectedWarning } ) => {
		mockUseSelector.mockImplementation( ( selector: ( state: unknown ) => unknown ) =>
			selector(
				createState( {
					third_party: {
						pressable: {
							usage,
							titan_usage: {
								orders: [],
							},
						},
					},
				} )
			)
		);

		render( <PressableUsageDetails existingPlan={ existingPlan } /> );

		expect( screen.getByText( expectedWarning ) ).toBeInTheDocument();

		const cta = screen.getByRole( 'link', { name: 'View Pressable add-ons' } );
		expect( cta ).toHaveAttribute( 'href', '/marketplace/products?category=pressable-addon' );
	} );
} );
