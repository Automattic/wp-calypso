/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WooHumanSupportRoutingStep } from '../woo-human-support-routing-step';
import type { WooHandoff } from '../../data/use-woo-handoff';
import type { WooHandoffData } from '../../human-routing/woo-handoff';
import type { HumanSupportRequest } from '@automattic/odie-client';

let mockHandoff: { data?: WooHandoff; isPending: boolean };
const mockRecordTracksEvent = jest.fn();

jest.mock( '../../data/use-woo-handoff', () => ( {
	useWooHandoff: () => mockHandoff,
} ) );

const loaded = ( data: WooHandoffData | null, isSupportBlocked = false ) => ( {
	data: { merchant: data, isSupportBlocked },
	isPending: false,
} );

jest.mock( '../../hooks/use-help-center-tracks-event', () => ( {
	useHelpCenterTracksEvent: () => mockRecordTracksEvent,
} ) );

const store = ( domain: string ) => ( { url: `https://${ domain }`, domain } );

const merchant = ( overrides: Partial< WooHandoffData > = {} ): WooHandoffData => ( {
	supportTier: 'tier_2',
	isPaying: true,
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
		{ slug: 'wc-core', name: 'WooCommerce', supportType: 'woo', isRevShare: false },
	],
	isVendor: false,
	...overrides,
} );

const request: HumanSupportRequest = {
	createdFrom: 'automatic_escalation',
	flags: { isEmergency: false, emergencyType: null, routeToEmail: false, isUnknownCharge: false },
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
	mockHandoff = loaded( merchant() );
} );

describe( 'WooHumanSupportRoutingStep', () => {
	it( "waits for the merchant's details", () => {
		mockHandoff = { isPending: true };
		renderStep();

		expect( screen.queryByLabelText( 'What do you need help with?' ) ).not.toBeInTheDocument();
		expect( continueButton() ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'turns away a merchant the support form blocks', async () => {
		mockHandoff = loaded( null, true );
		renderStep();

		expect(
			screen.getByText( /You no longer have access to our direct support channels/ )
		).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Done' } ) ).not.toBeInTheDocument();
		expect( dismiss ).not.toHaveBeenCalled();
		expect( startChat ).not.toHaveBeenCalled();
	} );

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
			row_id: 12,
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

	it( 'keeps Continue in view when questions are added', async () => {
		// jsdom doesn't scroll.
		const scrollIntoView = jest.fn();
		Element.prototype.scrollIntoView = scrollIntoView;
		try {
			renderStep();
			scrollIntoView.mockClear();

			await userEvent.selectOptions( question(), 'technical-support' );

			expect( scrollIntoView.mock.contexts ).toContain( continueButton().parentElement );
		} finally {
			delete ( Element.prototype as Partial< Element > ).scrollIntoView;
		}
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
			row_id: 12,
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
		mockHandoff = loaded( merchant( { connectedStores: [ store( 'one.example' ) ] } ) );
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
		mockHandoff = loaded( merchant( { connectedStores: [] } ) );
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
		expect( continueButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'asks only for the store for presales, and lets the merchant skip it', async () => {
		renderStep();

		await userEvent.selectOptions( question(), 'pre-sales' );

		expect( screen.queryByLabelText( 'Product' ) ).not.toBeInTheDocument();
		expect( screen.getByLabelText( 'Store' ) ).toBeInTheDocument();
		await userEvent.click( continueButton() );
		expect( lastDecision() ).toMatchObject( {
			route: 'ticket',
			row_id: 13,
			question: 'pre-sales',
			product: null,
			has_store: false,
		} );
	} );

	it( 'offers vendor questions to vendors only', () => {
		const { unmount } = renderStep();
		expect(
			screen.queryByRole( 'option', { name: 'Marketplace Vendors' } )
		).not.toBeInTheDocument();
		unmount();

		mockHandoff = loaded( merchant( { isVendor: true } ) );
		renderStep();
		expect( screen.getByRole( 'option', { name: 'Marketplace Vendors' } ) ).toBeInTheDocument();
	} );

	it( 'sends the request to a ticket without merchant data', async () => {
		mockHandoff = loaded( null );
		renderStep();

		await userEvent.selectOptions( question(), 'technical-support' );
		// No product list to pick from, and no stores, so only the store address is asked.
		expect( screen.queryByLabelText( 'Product' ) ).not.toBeInTheDocument();
		await userEvent.type( screen.getByLabelText( 'Store address' ), 'https://other.example' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( {
			route: 'ticket',
			row_id: 5,
			has_merchant_data: false,
		} );
	} );

	it( "uses the bot's emergency flag", async () => {
		mockHandoff = loaded( merchant( { isPaying: false } ) );
		renderStep( {
			...request,
			flags: {
				isEmergency: true,
				emergencyType: 'site_down',
				routeToEmail: false,
				isUnknownCharge: false,
			},
		} );

		await userEvent.selectOptions( question(), 'account' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( { route: 'ticket', row_id: 4, is_emergency: true } );
	} );

	it( "sends the bot's unknown charges to a ticket", async () => {
		renderStep( { ...request, flags: { ...request.flags, isUnknownCharge: true } } );

		await userEvent.selectOptions( question(), 'account' );
		await userEvent.click( continueButton() );

		expect( lastDecision() ).toMatchObject( {
			route: 'ticket',
			row_id: 2,
			is_unknown_charge: true,
		} );
	} );

	it( 'drops the request on cancel', async () => {
		renderStep();

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( dismiss ).toHaveBeenCalled();
		expect( startChat ).not.toHaveBeenCalled();
	} );

	describe( 'routes the Help Center answers itself', () => {
		it( 'links to the support of an externally supported product', async () => {
			renderStep();

			await userEvent.selectOptions( question(), 'technical-support' );
			await userEvent.selectOptions( screen.getByLabelText( 'Product' ), 'stripe-tax' );
			await userEvent.click( continueButton() );

			expect( screen.getByText( 'Stripe Tax has its own support' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Contact Stripe Tax Support' } ) ).toHaveAttribute(
				'href',
				'https://example.com/support'
			);
			expect( startChat ).not.toHaveBeenCalled();

			await userEvent.click( screen.getByRole( 'button', { name: 'Done' } ) );
			expect( dismiss ).toHaveBeenCalled();
		} );

		it( 'starts a chat for an externally supported product without a support link', async () => {
			mockHandoff = loaded(
				merchant( {
					supportedProducts: [
						{ slug: 'stripe-tax', name: 'Stripe Tax', supportType: 'external', isRevShare: false },
					],
				} )
			);
			renderStep();

			await userEvent.selectOptions( question(), 'technical-support' );
			await userEvent.selectOptions( screen.getByLabelText( 'Product' ), 'stripe-tax' );
			await userEvent.click( continueButton() );

			expect( startChat ).toHaveBeenCalled();
		} );

		it( "points to the forums for a Woo product when the merchant isn't paying", async () => {
			mockHandoff = loaded( merchant( { supportTier: 'tier_3', isPaying: false } ) );
			renderStep();

			await userEvent.selectOptions( question(), 'technical-support' );
			await userEvent.selectOptions(
				screen.getByLabelText( 'Product' ),
				'woocommerce-subscriptions'
			);
			await userEvent.selectOptions( screen.getByLabelText( 'Store' ), 'https://one.example' );
			await userEvent.click( continueButton() );

			expect( lastDecision() ).toMatchObject( { route: 'forums', row_id: 16 } );
			expect( screen.getByText( 'Ask the WooCommerce community' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: /community forums/ } ) ).toHaveAttribute(
				'href',
				'https://wordpress.org/support/plugin/woocommerce/'
			);
			expect( startChat ).not.toHaveBeenCalled();
		} );

		it( 'points to the forums after the AI reply for Core', async () => {
			renderStep();

			await userEvent.selectOptions( question(), 'technical-support' );
			await userEvent.selectOptions( screen.getByLabelText( 'Product' ), 'wc-core' );
			await userEvent.selectOptions( screen.getByLabelText( 'Store' ), 'https://one.example' );
			await userEvent.click( continueButton() );

			expect( lastDecision() ).toMatchObject( { route: 'ai-reply-then-forums', row_id: 11 } );
			expect(
				screen.getByText( /If you still need help, ask in the forums\./ )
			).toBeInTheDocument();
			expect( startChat ).not.toHaveBeenCalled();
		} );
	} );
} );
