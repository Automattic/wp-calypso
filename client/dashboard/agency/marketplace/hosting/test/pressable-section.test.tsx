/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import PressableSection from '../pressable-section';
import type { PressablePlanCategory } from '../lib/pressable-plans';
import type { AgencyProduct } from '@automattic/api-core';

jest.mock( '../pressable-usage-card', () => ( {
	__esModule: true,
	default: () => <div data-testid="usage-card" />,
} ) );

const API = 'https://public-api.wordpress.com';

function plan(
	name: string,
	category: PressablePlanCategory,
	limits: [ sites: number, visits: number, storage: number ]
): AgencyProduct {
	const [ sites, visits, storage ] = limits;
	return {
		name: `Pressable ${ name }`,
		slug: `pressable-${ name.toLowerCase().replace( ' ', '-' ) }`,
		product_id: 100 + sites,
		currency: 'USD',
		family_slug: 'pressable-hosting',
		monthly_price: 100,
		yearly_price: 1000,
		metadata: { category, sites, visits, storage, php_worker_count: 5 },
	};
}

const signature1 = plan( 'Signature 1', 'signature', [ 1, 30000, 20 ] );
const signature11 = plan( 'Signature 11', 'signature-high', [ 200, 3000000, 500 ] );
const premium1 = plan( 'Premium 1', 'premium', [ 1, 150000, 30 ] );
const premium2 = plan( 'Premium 2', 'premium', [ 1, 300000, 60 ] );
const standard1 = plan( 'Standard 1', 'standard', [ 1, 30000, 20 ] );
const enterprise4 = plan( 'Enterprise 4', 'enterprise', [ 100, 1000000, 200 ] );

const signatureCatalog = [ signature1, signature11, premium1, premium2 ];
const legacyCatalog = [ standard1, enterprise4 ];

function renderSection( props: Partial< React.ComponentProps< typeof PressableSection > > = {} ) {
	return render(
		<PressableSection
			products={ signatureCatalog }
			ownership="none"
			term="yearly"
			isReferralMode={ false }
			onAddToCart={ jest.fn() }
			{ ...props }
		/>
	);
}

const gateText = /Premium plans are sold through referrals/;
const planPicker = () => screen.queryByRole( 'combobox', { name: 'Select your plan' } );

describe( '<PressableSection> Premium plans', () => {
	beforeEach( () => {
		sessionStorage.clear();
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 1 } ] );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'with referrals off, the picker stays and the rail shows the gate', async () => {
		renderSection();

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans 1–11/ } ) );

		expect( planPicker() ).toHaveValue( premium1.slug );
		expect( screen.getByText( 'Pressable Premium 1' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Add Premium 1/ } ) ).not.toBeInTheDocument();
	} );

	test( 'with referrals on, the rail shows the price card', async () => {
		renderSection( { isReferralMode: true } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans 1–11/ } ) );

		expect( planPicker() ).toHaveValue( premium1.slug );
		expect( screen.getByRole( 'button', { name: 'Add Premium 1 to referral' } ) ).toBeVisible();
		expect( screen.queryByText( gateText ) ).not.toBeInTheDocument();
	} );

	test( 'on the legacy catalog there is no plan to pick, only the gate and the usage card', async () => {
		renderSection( { products: legacyCatalog, existingPlan: standard1, ownership: 'agency' } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans/ } ) );

		expect( planPicker() ).not.toBeInTheDocument();
		expect( screen.getByText( 'Pressable Premium' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.getByTestId( 'usage-card' ) ).toBeInTheDocument();
	} );

	test( 'an agency on a Premium plan sees its own plan named in the gate', async () => {
		renderSection( { products: legacyCatalog, existingPlan: premium1, ownership: 'agency' } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans/ } ) );

		expect( planPicker() ).not.toBeInTheDocument();
		expect( screen.getByText( 'Pressable Premium 1' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
	} );
} );
