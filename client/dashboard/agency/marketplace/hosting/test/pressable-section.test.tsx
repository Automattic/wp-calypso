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
const signature2 = plan( 'Signature 2', 'signature', [ 3, 75000, 35 ] );
const signature3 = plan( 'Signature 3', 'signature', [ 5, 125000, 50 ] );
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
const planTable = () => screen.queryByRole( 'table' );
const planRadio = ( name: string | RegExp ) => screen.getByRole( 'radio', { name } );

describe( '<PressableSection> Premium plans', () => {
	beforeEach( () => {
		sessionStorage.clear();
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 1 } ] );
	} );

	test( 'with referrals off, the picker stays and the rail shows the gate', async () => {
		renderSection();

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans 1–11/ } ) );

		expect( planRadio( 'Premium 1' ) ).toBeChecked();
		expect( screen.getByText( 'Pressable Premium 1' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Add Premium 1/ } ) ).not.toBeInTheDocument();
	} );

	test( 'with referrals on, the rail shows the price card', async () => {
		renderSection( { isReferralMode: true } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans 1–11/ } ) );

		expect( planRadio( 'Premium 1' ) ).toBeChecked();
		expect( screen.getByRole( 'button', { name: 'Add Premium 1 to referral' } ) ).toBeVisible();
		expect( screen.queryByText( gateText ) ).not.toBeInTheDocument();
	} );

	test( 'on the legacy catalog there is no plan to pick, only the gate and the usage card', async () => {
		renderSection( { products: legacyCatalog, existingPlan: standard1, ownership: 'agency' } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Premium plans/ } ) );

		expect( planTable() ).not.toBeInTheDocument();
		expect( screen.getByText( 'Pressable Premium' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.getByTestId( 'usage-card' ) ).toBeVisible();
	} );
} );

describe( '<PressableSection> plan picker', () => {
	const ownerCatalog = [ signature1, signature2, signature3, signature11, premium1, premium2 ];

	beforeEach( () => {
		sessionStorage.clear();
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 1 } ] );
	} );

	test( 'tags Premium as referral only while referrals are off', () => {
		renderSection();

		expect( planRadio( /Premium plans 1–11/ ) ).toHaveTextContent( 'Referral only' );
		expect( planRadio( /Premium plans 1–11/ ) ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	test( 'hides the plans below the agency’s own and marks its current plan', () => {
		renderSection( {
			products: ownerCatalog,
			existingPlan: signature2,
			ownership: 'agency',
		} );

		expect( screen.queryByRole( 'radio', { name: 'Signature 1' } ) ).not.toBeInTheDocument();
		expect( planRadio( /Signature 2/ ) ).toBeDisabled();
		expect( planRadio( /Signature 2/ ).closest( 'tr' ) ).toHaveTextContent( 'Current plan' );
		expect( planRadio( 'Signature 3' ) ).toBeChecked();
	} );

	test( 'disables the plan type below the agency’s plan', () => {
		renderSection( {
			products: ownerCatalog,
			existingPlan: signature11,
			ownership: 'agency',
		} );

		const lowType = planRadio( /Signature plans 1–10/ );
		expect( lowType ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( lowType ).toHaveTextContent( 'Below your plan' );
	} );

	test( 'referrals start from a clean slate: every plan is listed', () => {
		renderSection( {
			products: ownerCatalog,
			existingPlan: signature2,
			ownership: 'agency',
			isReferralMode: true,
		} );

		expect( planRadio( 'Signature 1' ) ).toBeEnabled();
		expect( screen.queryByText( 'Current plan' ) ).not.toBeInTheDocument();
	} );
} );
