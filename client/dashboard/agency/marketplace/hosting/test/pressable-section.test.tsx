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
	signature11,
	signature5,
	signature7,
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
const planPicker = () => screen.queryByRole( 'combobox', { name: 'Select your plan' } );

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

		await userEvent.click( screen.getByRole( 'radio', { name: /Performance plans/ } ) );

		expect( planPicker() ).toHaveValue( premium1.slug );
		expect( screen.getByText( 'Pressable Premium 1' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Add Premium 1/ } ) ).not.toBeInTheDocument();
	} );

	test( 'with referrals on, the rail shows the price card', async () => {
		renderSection( { isReferralMode: true } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Performance plans/ } ) );

		expect( planPicker() ).toHaveValue( premium1.slug );
		expect( screen.getByRole( 'button', { name: 'Add Premium 1 to referral' } ) ).toBeVisible();
		expect( screen.queryByText( gateText ) ).not.toBeInTheDocument();
	} );

	test( 'on the legacy catalog there is no plan to pick, only the gate and the usage card', async () => {
		renderSection( { products: legacyCatalog, existingPlan: standard1, ownership: 'agency' } );

		await userEvent.click( screen.getByRole( 'radio', { name: /Performance plans/ } ) );

		expect( planPicker() ).not.toBeInTheDocument();
		expect( screen.getByText( 'Pressable Performance' ) ).toBeVisible();
		expect( screen.getByText( gateText ) ).toBeVisible();
		expect( screen.getByTestId( 'usage-card' ) ).toBeVisible();
	} );
} );

describe( '<PressableSection> Agency plans', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	test( 'the Agency tab opens on its smallest plan', async () => {
		renderSection();

		await userEvent.click( screen.getByRole( 'radio', { name: /Agency plans/ } ) );

		expect( planPicker() ).toHaveValue( signature5.slug );
	} );

	test( 'an agency on the top Standard plan can only upgrade to Agency plans', () => {
		renderSection( { existingPlan: signature4, ownership: 'agency' } );

		expect( screen.getByRole( 'radio', { name: /Standard plans/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'an agency on an Agency plan opens on Agency with only bigger plans to pick', () => {
		renderSection( { existingPlan: signature7, ownership: 'agency' } );

		expect( screen.getByRole( 'radio', { name: /Standard plans/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByRole( 'radio', { name: /Agency plans/ } ) ).toBeChecked();
		expect( planPicker() ).toHaveValue( signature11.slug );
		expect( screen.getByRole( 'option', { name: /Signature 7/ } ) ).toBeDisabled();
		expect( screen.getByRole( 'option', { name: /Signature 11/ } ) ).toBeEnabled();
	} );
} );
