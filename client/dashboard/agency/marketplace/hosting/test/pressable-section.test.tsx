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
const signature4 = plan( 'Signature 4', 'signature', [ 10, 100000, 35 ] );
const signature5 = plan( 'Signature 5', 'signature-high', [ 20, 400000, 75 ] );
const signature7 = plan( 'Signature 7', 'signature-high', [ 40, 600000, 125 ] );
const signature11 = plan( 'Signature 11', 'signature-high', [ 200, 3000000, 500 ] );
const premium1 = plan( 'Premium 1', 'premium', [ 1, 150000, 30 ] );
const premium2 = plan( 'Premium 2', 'premium', [ 1, 300000, 60 ] );
const standard1 = plan( 'Standard 1', 'standard', [ 1, 30000, 20 ] );
const enterprise4 = plan( 'Enterprise 4', 'enterprise', [ 100, 1000000, 200 ] );

const signatureCatalog = [
	signature1,
	signature4,
	signature5,
	signature7,
	signature11,
	premium1,
	premium2,
];
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

const gateText = /Performance plans are sold through referrals/;
const performanceType = /Performance plans/;
const planTable = () => screen.queryByRole( 'table' );

describe( '<PressableSection> Performance plans', () => {
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

		await userEvent.click( screen.getByRole( 'radio', { name: performanceType } ) );

		expect( screen.getByRole( 'radio', { name: 'Premium 1' } ) ).toBeChecked();
		expect( screen.getByText( 'Pressable Premium 1' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Add Premium 1/ } ) ).not.toBeInTheDocument();
	} );

	test( 'with referrals on, the rail shows the price card', async () => {
		renderSection( { isReferralMode: true } );

		await userEvent.click( screen.getByRole( 'radio', { name: performanceType } ) );

		expect( screen.getByRole( 'radio', { name: 'Premium 1' } ) ).toBeChecked();
		expect( screen.getByRole( 'button', { name: 'Add Premium 1 to referral' } ) ).toBeVisible();
		expect( screen.queryByText( gateText ) ).not.toBeInTheDocument();
	} );

	test( 'on the legacy catalog there is no plan to pick, only the gate and the usage card', async () => {
		renderSection( { products: legacyCatalog, existingPlan: standard1, ownership: 'agency' } );

		await userEvent.click( screen.getByRole( 'radio', { name: performanceType } ) );

		expect( planTable() ).not.toBeInTheDocument();
		expect( screen.getByText( 'Pressable Performance' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.getByTestId( 'usage-card' ) ).toBeVisible();
	} );
} );

describe( '<PressableSection> plan table', () => {
	const ownerCatalog = [ signature1, signature2, signature3, signature11, premium1, premium2 ];

	beforeEach( () => {
		sessionStorage.clear();
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 1 } ] );
	} );

	test( 'leaves out the plans below the agency’s own and marks its current plan', () => {
		renderSection( { products: ownerCatalog, existingPlan: signature2, ownership: 'agency' } );

		expect( screen.queryByRole( 'radio', { name: 'Signature 1' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'radio', { name: 'Signature 2' } ) ).toBeDisabled();
		expect( screen.getByText( 'Current plan' ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: 'Signature 3' } ) ).toBeChecked();
	} );

	test( 'disables the plan type below the agency’s plan', () => {
		renderSection( { products: ownerCatalog, existingPlan: signature11, ownership: 'agency' } );

		const standardType = screen.getByRole( 'radio', { name: /Standard plans/ } );
		expect( standardType ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( standardType ).toHaveTextContent( 'Below your plan' );
	} );

	test( 'lists every plan in referral mode, whatever the agency owns', () => {
		renderSection( {
			products: ownerCatalog,
			existingPlan: signature2,
			ownership: 'agency',
			isReferralMode: true,
		} );

		expect( screen.getByRole( 'radio', { name: 'Signature 1' } ) ).toBeEnabled();
		expect( screen.queryByText( 'Current plan' ) ).not.toBeInTheDocument();
	} );

	test( 'keeps Performance plans open for an agency on a Standard plan', async () => {
		renderSection( {
			products: ownerCatalog,
			existingPlan: signature2,
			ownership: 'agency',
		} );

		await userEvent.click( screen.getByRole( 'radio', { name: performanceType } ) );

		expect( screen.getByRole( 'radio', { name: 'Premium 1' } ) ).toBeEnabled();
		expect( screen.getByRole( 'radio', { name: 'Premium 2' } ) ).toBeEnabled();
	} );

	test( 'does not mark Performance as below the plan of a legacy Premium owner', () => {
		renderSection( {
			products: [ ...legacyCatalog, premium1 ],
			existingPlan: premium1,
			ownership: 'agency',
		} );

		const performanceTab = screen.getByRole( 'radio', { name: performanceType } );
		expect( performanceTab ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( performanceTab ).not.toHaveTextContent( 'Below your plan' );
	} );

	test( 'opens the Agency plans for an agency on the largest Standard plan', () => {
		renderSection( {
			products: [ signature1, signature4, signature5, signature11, premium1 ],
			existingPlan: signature4,
			ownership: 'agency',
		} );

		const standardType = screen.getByRole( 'radio', { name: /Standard plans/ } );
		expect( standardType ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( standardType ).toHaveTextContent( 'Your plan type' );
		expect( screen.getByRole( 'radio', { name: 'Signature 5' } ) ).toBeChecked();
	} );
} );

describe( '<PressableSection> Agency plans', () => {
	beforeEach( () => {
		sessionStorage.clear();
		nock( API )
			.persist()
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: 1 } ] );
	} );

	test( 'the Agency tab opens on its smallest plan', async () => {
		renderSection();

		await userEvent.click( screen.getByRole( 'radio', { name: /Agency plans/ } ) );

		expect( screen.getByRole( 'radio', { name: 'Signature 5' } ) ).toBeChecked();
	} );

	test( 'an agency on an Agency plan opens on Agency with only bigger plans to pick', () => {
		renderSection( { existingPlan: signature7, ownership: 'agency' } );

		expect( screen.getByRole( 'radio', { name: /Standard plans/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByRole( 'radio', { name: /Agency plans/ } ) ).toBeChecked();
		expect( screen.queryByRole( 'radio', { name: 'Signature 5' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'radio', { name: 'Signature 7' } ) ).toBeDisabled();
		expect( screen.getByRole( 'radio', { name: 'Signature 11' } ) ).toBeChecked();
	} );
} );
