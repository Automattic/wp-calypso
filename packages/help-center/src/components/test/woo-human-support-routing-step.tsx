/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WooHumanSupportRoutingStep } from '../woo-human-support-routing-step';
import type { WooHandoffData } from '../../human-routing/woo-handoff';
import type { HumanSupportRequest } from '@automattic/odie-client';

let mockWooHandoff: WooHandoffData | null = null;
const mockRecordTracksEvent = jest.fn();

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useHelpCenterContext: () => ( { wooHandoff: mockWooHandoff } ),
} ) );

jest.mock( '../../hooks/use-help-center-tracks-event', () => ( {
	useHelpCenterTracksEvent: () => mockRecordTracksEvent,
} ) );

const store = ( domain: string ) => ( { url: `https://${ domain }`, domain } );

const merchant = ( overrides: Partial< WooHandoffData > = {} ): WooHandoffData => ( {
	supportTier: 'tier_2',
	isPaying: true,
	isTargetCustomer: false,
	isWooEnterpriseCustomer: false,
	connectedStores: [ store( 'one.example' ), store( 'two.example' ) ],
	supportedProducts: [
		{
			slug: 'woocommerce-subscriptions',
			name: 'WooCommerce Subscriptions',
			supportType: 'woo',
			isRevShare: false,
		},
		{
			slug: 'stripe-tax',
			name: 'Stripe Tax',
			supportType: 'external',
			isRevShare: false,
			externalSupportUrl: 'https://example.com/support',
		},
	],
	isVendor: false,
	...overrides,
} );

const request: HumanSupportRequest = {
	createdFrom: 'automatic_escalation',
	flags: { isEmergency: false, emergencyType: null, routeToEmail: false },
};

const startChat = jest.fn();
const dismiss = jest.fn();

const renderStep = ( humanSupportRequest = request ) =>
	render(
		<WooHumanSupportRoutingStep
			request={ humanSupportRequest }
			startChat={ startChat }
			dismiss={ dismiss }
		/>
	);

const question = () => screen.getByLabelText( 'What do you need help with?' );
const continueButton = () => screen.getByRole( 'button', { name: 'Continue' } );

const lastDecision = () =>
	mockRecordTracksEvent.mock.calls.find(
		( [ name ] ) => name === 'calypso_helpcenter_human_support_routing_decided'
	)?.[ 1 ];

beforeEach( () => {
	jest.clearAllMocks();
	mockWooHandoff = merchant();
} );

describe( 'WooHumanSupportRoutingStep', () => {
	it( 'waits for the type of question', async () => {
		renderStep();

		expect( continueButton() ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.selectOptions( question(), 'account' );

		expect( continueButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( screen.queryByLabelText( 'Product' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Store' ) ).not.toBeInTheDocument();
	} );

	it( 'routes the request with the table and starts the chat', async () => {
		renderStep();

		await userEvent.selectOptions( question(), 'account' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( {
			route: 'chat',
			row_id: 10,
			question: 'account',
			has_merchant_data: true,
			created_from: 'automatic_escalation',
		} );
		expect( startChat ).toHaveBeenCalled();
	} );

	it( 'starts only one chat on a double click', async () => {
		renderStep();

		await userEvent.selectOptions( question(), 'account' );
		await userEvent.dblClick( continueButton() );

		expect( startChat ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'asks for the product and store for technical support', async () => {
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		expect( continueButton() ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.selectOptions(
			screen.getByLabelText( 'Product' ),
			'woocommerce-subscriptions'
		);
		expect( continueButton() ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.selectOptions( screen.getByLabelText( 'Store' ), 'https://two.example' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( {
			route: 'chat',
			row_id: 10,
			product: 'woocommerce-subscriptions',
			has_store: true,
		} );
	} );

	it( 'asks for the address of another site', async () => {
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		await userEvent.selectOptions(
			screen.getByLabelText( 'Product' ),
			'woocommerce-subscriptions'
		);
		await userEvent.selectOptions( screen.getByLabelText( 'Store' ), 'another-site' );
		expect( continueButton() ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.type( screen.getByLabelText( 'Store address' ), 'https://other.example' );

		expect( continueButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( "doesn't ask for the store when there is only one", async () => {
		mockWooHandoff = merchant( { connectedStores: [ store( 'one.example' ) ] } );
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		await userEvent.selectOptions(
			screen.getByLabelText( 'Product' ),
			'woocommerce-subscriptions'
		);

		expect( screen.queryByLabelText( 'Store' ) ).not.toBeInTheDocument();
		await userEvent.click( continueButton() );
		expect( lastDecision() ).toMatchObject( { has_store: true } );
	} );

	it( 'asks for the store address when no store is connected', async () => {
		mockWooHandoff = merchant( { connectedStores: [] } );
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		await userEvent.selectOptions(
			screen.getByLabelText( 'Product' ),
			'woocommerce-subscriptions'
		);

		expect( screen.queryByLabelText( 'Store' ) ).not.toBeInTheDocument();
		expect( screen.getByLabelText( 'Store address' ) ).toBeInTheDocument();
	} );

	it( "doesn't ask for the store for an externally supported product", async () => {
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		await userEvent.selectOptions( screen.getByLabelText( 'Product' ), 'stripe-tax' );

		expect( screen.queryByLabelText( 'Store' ) ).not.toBeInTheDocument();
		await userEvent.click( continueButton() );
		expect( lastDecision() ).toMatchObject( { route: 'link-out', row_id: 6 } );
	} );

	it( 'offers vendor questions to vendors only', () => {
		const { unmount } = renderStep();
		expect(
			screen.queryByRole( 'option', { name: 'Marketplace Vendors' } )
		).not.toBeInTheDocument();
		unmount();

		mockWooHandoff = merchant( { isVendor: true } );
		renderStep();
		expect( screen.getByRole( 'option', { name: 'Marketplace Vendors' } ) ).toBeInTheDocument();
	} );

	it( "routes like a merchant who isn't paying without merchant data", async () => {
		mockWooHandoff = null;
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		// No product list to pick from, and no stores, so only the store address is asked.
		expect( screen.queryByLabelText( 'Product' ) ).not.toBeInTheDocument();
		await userEvent.type( screen.getByLabelText( 'Store address' ), 'https://other.example' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( {
			route: 'forums',
			row_id: 14,
			has_merchant_data: false,
		} );
	} );

	it( "uses the bot's emergency flag", async () => {
		mockWooHandoff = merchant( { isPaying: false } );
		renderStep( {
			...request,
			flags: { isEmergency: true, emergencyType: 'site_down', routeToEmail: false },
		} );

		await userEvent.selectOptions( question(), 'account' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( { route: 'ticket', row_id: 3, is_emergency: true } );
	} );

	it( 'drops the request on cancel', async () => {
		renderStep();

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( dismiss ).toHaveBeenCalled();
		expect( startChat ).not.toHaveBeenCalled();
	} );
} );
