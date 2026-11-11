/**
 * @jest-environment jsdom
 */
import { assignNewCardProcessor } from '../assign-new-card-processor';
import type { Purchase } from '@automattic/api-core';
import type { StripeConfiguration } from '@automattic/calypso-stripe';
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';

// The Stripe SDK confirmation step is not an HTTP boundary nock can intercept.
jest.mock( '@automattic/calypso-stripe', () => ( {
	confirmStripeSetupIntentAndAttachCard: jest.fn( async () => ( {
		id: 'seti_123_secret',
		payment_method: 'pm_123',
	} ) ),
} ) );

function setup( { purchase }: { purchase?: Purchase } = {} ) {
	const saveCreditCard = jest.fn( async () => ( {} ) );
	const updateCreditCard = jest.fn( async () => ( {} ) );

	const run = ( submitData: Record< string, unknown > ) =>
		assignNewCardProcessor(
			{
				purchase,
				stripe: {} as Stripe,
				stripeConfiguration: { processor_id: 'stripe_ie' } as StripeConfiguration,
				createStripeSetupIntent: async () => ( { setup_intent_id: 'seti_123' } ),
				saveCreditCard,
				updateCreditCard,
			},
			{
				countryCode: 'US',
				postalCode: '44101',
				useForAllSubscriptions: false,
				cardElement: {} as StripeCardNumberElement,
				...submitData,
			}
		);

	return { run, saveCreditCard, updateCreditCard };
}

describe( 'assignNewCardProcessor business use declaration', () => {
	test( 'sends a positive business use declaration when saving a new card', async () => {
		const { run, saveCreditCard } = setup();

		await run( { useForBusiness: true } );

		expect( saveCreditCard ).toHaveBeenCalledWith(
			expect.objectContaining( { taxIsForBusiness: true } )
		);
	} );

	test( 'sends a negative business use declaration when the buyer leaves the box unchecked', async () => {
		const { run, saveCreditCard } = setup();

		await run( { useForBusiness: false } );

		expect( saveCreditCard ).toHaveBeenCalledWith(
			expect.objectContaining( { taxIsForBusiness: false } )
		);
	} );

	test( 'omits the declaration when the location is not eligible for it', async () => {
		const { run, saveCreditCard } = setup();

		await run( { postalCode: '94107' } );

		expect( saveCreditCard ).toHaveBeenCalledWith(
			expect.objectContaining( { taxIsForBusiness: undefined } )
		);
	} );

	test( 'sends the declaration when replacing the card on an existing purchase', async () => {
		const { run, updateCreditCard } = setup( { purchase: { ID: 456 } as Purchase } );

		await run( { useForBusiness: true } );

		expect( updateCreditCard ).toHaveBeenCalledWith(
			expect.objectContaining( { taxIsForBusiness: true } )
		);
	} );
} );
