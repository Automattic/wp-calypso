import { DomainAvailabilityStatus } from '@automattic/api-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSuggestionCTA } from '..';
import { convertAvailabilityToSuggestion } from '../../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../../hooks/use-suggestion';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildCartItem } from '../../../test-helpers/factories/cart';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetAvailabilityQuery } from '../../../test-helpers/queries/availability';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { DomainSuggestionsList } from '../../../ui';

describe( 'DomainSuggestionCTA', () => {
	describe( 'Add to cart cta', () => {
		it( 'allows adding a domain to the cart', async () => {
			const user = userEvent.setup();

			const suggestion = buildSuggestion( {
				domain_name: 'test-add-to-cart.com',
				vendor: 'donuts',
				is_premium: true,
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test-add-to-cart' },
				suggestions: [ suggestion ],
			} );

			const availability = buildAvailability( {
				domain_name: 'test-add-to-cart.com',
				status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
				is_supported_premium_domain: true,
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-add-to-cart.com' },
				availability,
			} );

			const onAddDomainToCart = jest.fn();
			const onDomainAddAvailabilityPreCheck = jest.fn();
			const onSuggestionInteract = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-add-to-cart"
					events={ { onAddDomainToCart, onDomainAddAvailabilityPreCheck, onSuggestionInteract } }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-add-to-cart.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			expect( addToCartCta ).toBeInTheDocument();

			await user.click( addToCartCta );

			await waitFor( () => {
				expect( onSuggestionInteract ).toHaveBeenCalledWith( {
					...suggestion,
					position: 0,
					price_rule: DomainPriceRule.PRICE,
				} );

				expect( onAddDomainToCart ).toHaveBeenCalledWith(
					'test-add-to-cart.com',
					0,
					true,
					'donuts'
				);

				expect( onDomainAddAvailabilityPreCheck ).toHaveBeenCalledWith(
					availability,
					'test-add-to-cart.com',
					'donuts'
				);
			} );
		} );

		/**
		 * The scenario in this test case can happen when the user searches for a FQDN with a
		 * TLD that's not present in the TLDs filter
		 */
		it( 'allows adding a domain to the cart if the user searched for a FQDN that is not in the suggestion list', async () => {
			const user = userEvent.setup();

			const suggestion = buildSuggestion( {
				domain_name: 'test-add-to-cart.blog',
				vendor: 'donuts',
			} );

			mockGetSuggestionsQuery( {
				params: { query: 'test-add-to-cart.com' },
				suggestions: [ suggestion ],
			} );

			const availability = buildAvailability( {
				domain_name: 'test-add-to-cart.com',
				status: DomainAvailabilityStatus.AVAILABLE,
				product_id: 123,
				product_slug: 'dotcom_domain',
				raw_price: 40,
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-add-to-cart.com' },
				availability,
			} );

			const onAddDomainToCart = jest.fn();
			const onDomainAddAvailabilityPreCheck = jest.fn();
			const onSuggestionInteract = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-add-to-cart.com"
					events={ { onAddDomainToCart, onDomainAddAvailabilityPreCheck, onSuggestionInteract } }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-add-to-cart.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			expect( addToCartCta ).toBeInTheDocument();

			await user.click( addToCartCta );

			const availabilitySuggestion = convertAvailabilityToSuggestion( availability );

			await waitFor( () => {
				expect( onSuggestionInteract ).toHaveBeenCalledWith( {
					...availabilitySuggestion,
					position: 0,
					price_rule: DomainPriceRule.PRICE,
				} );

				expect( onAddDomainToCart ).toHaveBeenCalledWith(
					'test-add-to-cart.com',
					0, // position
					false, // is_premium
					'availability' // vendor
				);

				expect( onDomainAddAvailabilityPreCheck ).toHaveBeenCalledWith(
					availability,
					'test-add-to-cart.com',
					'availability' // root_vendor
				);
			} );
		} );

		it( 'disables the cta if some other mutation is happening', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-add-to-cart-mutation' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-add-to-cart-mutation.com' } ),
					buildSuggestion( { domain_name: 'test-add-to-cart-mutation.net' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-add-to-cart-mutation.net' },
				availability: buildAvailability( {
					domain_name: 'test-add-to-cart-mutation.net',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-add-to-cart-mutation.com' },
				availability: buildAvailability( {
					domain_name: 'test-add-to-cart-mutation.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-add-to-cart-mutation">
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-add-to-cart-mutation.com" />
						<DomainSuggestionCTA domainName="test-add-to-cart-mutation.net" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const [ dotCom, dotNet ] = await screen.findAllByRole( 'button', { name: 'Add to cart' } );

			await user.click( dotCom );

			await waitFor( () => {
				expect( dotCom ).toBeDisabled();
				expect( dotCom ).toHaveClass( 'is-busy' );

				expect( dotNet ).toBeDisabled();
				expect( dotNet ).not.toHaveClass( 'is-busy' );
			} );
		} );
	} );

	describe( 'trademark claims notice', () => {
		it( 'opens the modal if the domain includes require a trademark claim acceptance', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-trademark-claim.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-trademark-claim.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-trademark-claim.com' },
				availability: buildAvailability( {
					domain_name: 'test-trademark-claim.com',
					status: DomainAvailabilityStatus.AVAILABLE,
					trademark_claims_notice_info: {
						claim: {
							markName: 'Test Trademark',
						},
					},
				} ),
			} );

			const onTrademarkClaimsNoticeShown = jest.fn();
			const onAddDomainToCart = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-trademark-claim.com"
					events={ { onTrademarkClaimsNoticeShown, onAddDomainToCart } }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-trademark-claim.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			await user.click( addToCartCta );

			expect(
				screen.getByText( 'test-trademark-claim.com matches a trademark.' )
			).toBeInTheDocument();

			expect( screen.getByText( 'Test Trademark' ) ).toBeInTheDocument();

			expect( onTrademarkClaimsNoticeShown ).toHaveBeenCalled();
			expect( onAddDomainToCart ).not.toHaveBeenCalled();
		} );

		it( 'does not add the domain to the cart if the user does not accept the trademark claim', async () => {
			const user = userEvent.setup();

			const suggestion = buildSuggestion( { domain_name: 'test-trademark-claim.com' } );

			mockGetSuggestionsQuery( {
				params: { query: 'test-trademark-claim.com' },
				suggestions: [ suggestion ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-trademark-claim.com' },
				availability: buildAvailability( {
					domain_name: 'test-trademark-claim.com',
					status: DomainAvailabilityStatus.AVAILABLE,
					trademark_claims_notice_info: {
						claim: {
							markName: 'Test Trademark',
						},
					},
				} ),
			} );

			const onTrademarkClaimsNoticeClosed = jest.fn();
			const onAddDomainToCart = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-trademark-claim.com"
					events={ { onTrademarkClaimsNoticeClosed, onAddDomainToCart } }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-trademark-claim.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			await user.click( addToCartCta );

			expect(
				screen.getByText( 'test-trademark-claim.com matches a trademark.' )
			).toBeInTheDocument();

			const closeCta = await screen.findByRole( 'button', { name: 'Close' } );

			await user.click( closeCta );

			await waitFor( () => {
				expect( onAddDomainToCart ).not.toHaveBeenCalled();

				expect( onTrademarkClaimsNoticeClosed ).toHaveBeenCalledWith( {
					...suggestion,
					position: 0,
					price_rule: DomainPriceRule.PRICE,
				} );
			} );
		} );

		it( 'adds the domain to the cart if the user accepts the trademark claim', async () => {
			const user = userEvent.setup();

			const suggestion = buildSuggestion( { domain_name: 'test-trademark-claim.com' } );

			mockGetSuggestionsQuery( {
				params: { query: 'test-trademark-claim.com' },
				suggestions: [ suggestion ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-trademark-claim.com' },
				availability: buildAvailability( {
					domain_name: 'test-trademark-claim.com',
					status: DomainAvailabilityStatus.AVAILABLE,
					trademark_claims_notice_info: {
						claim: {
							markName: 'Test Trademark',
						},
					},
				} ),
			} );

			const onTrademarkClaimsNoticeAccepted = jest.fn();
			const onTrademarkClaimsNoticeClosed = jest.fn();
			const onAddDomainToCart = jest.fn();
			const onDomainAddAvailabilityPreCheck = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test-trademark-claim.com"
					events={ {
						onTrademarkClaimsNoticeAccepted,
						onTrademarkClaimsNoticeClosed,
						onAddDomainToCart,
						onDomainAddAvailabilityPreCheck,
					} }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-trademark-claim.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			await user.click( addToCartCta );

			expect(
				screen.getByText( 'test-trademark-claim.com matches a trademark.' )
			).toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Acknowledge trademark' } ) );

			await waitFor( () => {
				expect( onTrademarkClaimsNoticeAccepted ).toHaveBeenCalledWith( {
					...suggestion,
					position: 0,
					price_rule: DomainPriceRule.PRICE,
				} );

				expect( onDomainAddAvailabilityPreCheck ).toHaveBeenCalledTimes( 1 );
				expect( onAddDomainToCart ).toHaveBeenCalledTimes( 1 );

				expect( onTrademarkClaimsNoticeClosed ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'continue cta', () => {
		it( 'allows continuing if the domain is already on the cart', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-regular-price.com' },
				suggestions: [ buildSuggestion( { domain_name: 'test-regular-price.com' } ) ],
			} );

			const onContinue = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					initialCartItems={ [ buildCartItem( { domain: 'test-regular-price', tld: 'com' } ) ] }
					query="test-regular-price.com"
					events={ { onContinue } }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-regular-price.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const continueCta = await screen.findByRole( 'button', { name: 'Continue' } );

			expect( continueCta ).toBeInTheDocument();

			await user.click( continueCta );

			expect( onContinue ).toHaveBeenCalled();
		} );

		it( 'disables the continue cta if some other mutation is happening', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-continue-multiple' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-continue-multiple.com' } ),
					buildSuggestion( { domain_name: 'test-continue-multiple.net' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-continue-multiple.net' },
				availability: buildAvailability( {
					domain_name: 'test-continue-multiple.net',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			const mutation = Promise.withResolvers< void >();

			render(
				<TestDomainSearchWithSuggestions
					operationPromise={ mutation.promise }
					initialCartItems={ [ buildCartItem( { domain: 'test-continue-multiple', tld: 'com' } ) ] }
					query="test-continue-multiple"
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-continue-multiple.com" />
						<DomainSuggestionCTA domainName="test-continue-multiple.net" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const continueCta = await screen.findByRole( 'button', { name: 'Continue' } );

			expect( continueCta ).toBeInTheDocument();
			expect( continueCta ).toBeEnabled();

			const addToCartCta = screen.getByRole( 'button', { name: 'Add to cart' } );

			expect( addToCartCta ).toBeInTheDocument();
			expect( addToCartCta ).toBeEnabled();

			await user.click( addToCartCta );

			expect( continueCta ).toBeDisabled();

			mutation.resolve();

			await waitFor( () => {
				expect( continueCta ).toBeEnabled();
			} );
		} );
	} );

	describe( 'error cta', () => {
		it( 'shows the error message if the operation fails', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-error' },
				suggestions: [ buildSuggestion( { domain_name: 'test-error.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-error.com' },
				availability: new Error( 'Failed to fetch the availability' ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-error">
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-error.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			expect( addToCartCta ).toBeInTheDocument();

			await user.click( addToCartCta );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Add to cart' } ) ).toHaveClass(
					'is-destructive'
				);
			} );

			await user.hover( screen.getByRole( 'button', { name: 'Add to cart' } ) );

			await waitFor( () => {
				expect( screen.getByText( 'Failed to fetch the availability' ) ).toBeInTheDocument();
			} );
		} );

		it( 'allows retrying the operation', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test-error' },
				suggestions: [ buildSuggestion( { domain_name: 'test-error.com' } ) ],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-error.com' },
				availability: new Error( 'Failed to fetch the availability' ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test-error">
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-error.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const addToCartCta = await screen.findByRole( 'button', { name: 'Add to cart' } );

			expect( addToCartCta ).toBeInTheDocument();

			await user.click( addToCartCta );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Add to cart' } ) ).toHaveClass(
					'is-destructive'
				);
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-error.com' },
				availability: buildAvailability( {
					domain_name: 'test-error.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			await user.click( screen.getByRole( 'button', { name: 'Add to cart' } ) );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeInTheDocument();
			} );
		} );

		it( 'only displays the error message if its the latest operation', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test' },
				suggestions: [
					buildSuggestion( { domain_name: 'test-error.com' } ),
					buildSuggestion( { domain_name: 'test-success.com' } ),
				],
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-error.com' },
				availability: new Error( 'Failed to fetch the availability' ),
			} );

			mockGetAvailabilityQuery( {
				params: { domainName: 'test-success.com' },
				availability: buildAvailability( {
					domain_name: 'test-success.com',
					status: DomainAvailabilityStatus.AVAILABLE,
				} ),
			} );

			render(
				<TestDomainSearchWithSuggestions query="test">
					<DomainSuggestionsList>
						<DomainSuggestionCTA domainName="test-error.com" />
						<DomainSuggestionCTA domainName="test-success.com" />
					</DomainSuggestionsList>
				</TestDomainSearchWithSuggestions>
			);

			const [ errorCta, successCta ] = await screen.findAllByRole( 'button', {
				name: 'Add to cart',
			} );

			expect( errorCta ).toBeInTheDocument();
			expect( successCta ).toBeInTheDocument();

			await user.click( errorCta );

			await waitFor( () => {
				const [ errorCta, successCta ] = screen.getAllByRole( 'button', {
					name: 'Add to cart',
				} );

				expect( errorCta ).toHaveClass( 'is-destructive' );
				expect( successCta ).not.toHaveClass( 'is-destructive' );
			} );

			await user.click( successCta );

			await waitFor( () => {
				expect( errorCta ).not.toHaveClass( 'is-destructive' );
				expect( successCta ).toHaveClass( 'is-busy' );
			} );
		} );
	} );

	it( 'allows contacting support if the premium domain is too expensive', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-expensive-premium.com' },
			suggestions: [
				buildSuggestion( {
					domain_name: 'test-expensive-premium.com',
					is_premium: true,
				} ),
			],
		} );

		mockGetAvailabilityQuery( {
			params: { domainName: 'test-expensive-premium.com' },
			availability: buildAvailability( {
				domain_name: 'test-expensive-premium.com',
				status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
				is_price_limit_exceeded: true,
			} ),
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-expensive-premium.com">
				<DomainSuggestionsList>
					<DomainSuggestionCTA domainName="test-expensive-premium.com" />
				</DomainSuggestionsList>
			</TestDomainSearchWithSuggestions>
		);

		const contactSupportCta = await screen.findByRole( 'link', {
			name: 'Interested in this domain? Contact support',
		} );

		expect( contactSupportCta ).toBeInTheDocument();
		expect( contactSupportCta ).toHaveAttribute( 'href', 'https://wordpress.com/help/contact' );
	} );
} );
