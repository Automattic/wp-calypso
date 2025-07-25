import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSuggestionCTA } from '..';
import { DomainSuggestionContainerContext } from '../../../hooks/use-domain-suggestion-container';
import { buildDomain, buildDomainSearchCart } from '../../../test-helpers/factories';
import { DomainSearch } from '../../domain-search';
import { DomainSuggestionsList } from '../../domain-suggestions-list';

describe( 'DomainSuggestionCTA', () => {
	it( 'should render Add to Cart button when domain is not in cart', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestionCTA uuid="1" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Add to Cart' } );
		expect( button ).toBeInTheDocument();
	} );

	it( 'should render Continue button when domain is in cart', () => {
		render(
			<DomainSearch
				cart={ buildDomainSearchCart( {
					items: [ buildDomain( { uuid: '1' } ) ],
					hasItem: ( uuid ) => uuid === '1',
				} ) }
				onContinue={ jest.fn() }
			>
				<DomainSuggestionsList>
					<DomainSuggestionCTA uuid="1" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		expect( button ).toBeInTheDocument();
	} );

	it( 'should call onAddItem when Add to Cart is clicked', async () => {
		const onAddItem = jest.fn();

		render(
			<DomainSearch
				cart={ buildDomainSearchCart( {
					items: [],
					onAddItem,
				} ) }
				onContinue={ jest.fn() }
			>
				<DomainSuggestionsList>
					<DomainSuggestionCTA uuid="1" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Add to Cart' } );
		await userEvent.click( button );

		expect( onAddItem ).toHaveBeenCalledWith( '1' );
	} );

	it( 'should call onContinue when Continue is clicked', async () => {
		const onContinue = jest.fn();

		render(
			<DomainSearch
				cart={ buildDomainSearchCart( {
					items: [ buildDomain( { uuid: '1' } ) ],
					hasItem: ( uuid ) => uuid === '1',
				} ) }
				onContinue={ onContinue }
			>
				<DomainSuggestionsList>
					<DomainSuggestionCTA uuid="1" />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		await userEvent.click( button );

		expect( onContinue ).toHaveBeenCalled();
	} );

	it( 'should call onClick with add-to-cart when Add to Cart is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionsList>
					<DomainSuggestionCTA uuid="1" onClick={ onClick } />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		await user.click( screen.getByRole( 'button', { name: 'Add to Cart' } ) );

		expect( onClick ).toHaveBeenCalledWith( 'add-to-cart' );
	} );

	it( 'should call onClick with continue when Continue is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render(
			<DomainSearch
				cart={ buildDomainSearchCart( {
					items: [ buildDomain( { uuid: '1' } ) ],
					hasItem: ( uuid ) => uuid === '1',
				} ) }
				onContinue={ jest.fn() }
			>
				<DomainSuggestionsList>
					<DomainSuggestionCTA uuid="1" onClick={ onClick } />
				</DomainSuggestionsList>
			</DomainSearch>
		);

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onClick ).toHaveBeenCalledWith( 'continue' );
	} );

	describe( 'when rendering within a list', () => {
		it( 'should not show Add to Cart text', () => {
			render(
				<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
					<DomainSuggestionsList>
						<DomainSuggestionCTA uuid="1" />
					</DomainSuggestionsList>
				</DomainSearch>
			);

			const button = screen.getByRole( 'button', { name: 'Add to Cart' } );
			expect( button ).toHaveTextContent( '' );
		} );

		it( 'should not show Continue text', () => {
			render(
				<DomainSearch
					cart={ buildDomainSearchCart( {
						items: [ buildDomain( { uuid: '1' } ) ],
						hasItem: ( uuid ) => uuid === '1',
					} ) }
					onContinue={ jest.fn() }
				>
					<DomainSuggestionsList>
						<DomainSuggestionCTA uuid="1" />
					</DomainSuggestionsList>
				</DomainSearch>
			);

			const button = screen.getByRole( 'button', { name: 'Continue' } );
			expect( button ).toHaveTextContent( '' );
		} );
	} );

	describe( 'when rendered as a featured suggestion', () => {
		it( 'should show Add to Cart text', () => {
			render(
				<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
					<DomainSuggestionContainerContext.Provider
						value={ { activeQuery: 'large', isFeatured: true } }
					>
						<DomainSuggestionCTA uuid="1" />
					</DomainSuggestionContainerContext.Provider>
				</DomainSearch>
			);

			const button = screen.getByRole( 'button', { name: 'Add to Cart' } );
			expect( button ).toHaveTextContent( 'Add to Cart' );
		} );

		it( 'should show Continue text', () => {
			render(
				<DomainSearch
					cart={ buildDomainSearchCart( {
						items: [ buildDomain( { uuid: '1' } ) ],
						hasItem: ( uuid ) => uuid === '1',
					} ) }
					onContinue={ jest.fn() }
				>
					<DomainSuggestionContainerContext.Provider
						value={ { activeQuery: 'large', isFeatured: true } }
					>
						<DomainSuggestionCTA uuid="1" />
					</DomainSuggestionContainerContext.Provider>
				</DomainSearch>
			);

			const button = screen.getByRole( 'button', { name: 'Continue' } );
			expect( button ).toHaveTextContent( 'Continue' );
		} );
	} );
} );
