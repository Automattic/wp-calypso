import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainSuggestionCTA } from '..';
import { buildDomain, buildDomainSearchCart } from '../../../test-helpers/factories';
import { DomainSearch } from '../../domain-search';

describe( 'DomainSuggestionCTA', () => {
	it( 'should render Add to Cart button when domain is not in cart', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionCTA uuid="1" />
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
				<DomainSuggestionCTA uuid="1" />
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
				<DomainSuggestionCTA uuid="1" />
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
				<DomainSuggestionCTA uuid="1" />
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		await userEvent.click( button );

		expect( onContinue ).toHaveBeenCalled();
	} );

	it( 'should not show Add to Cart text when compact prop is true', () => {
		render(
			<DomainSearch cart={ buildDomainSearchCart() } onContinue={ jest.fn() }>
				<DomainSuggestionCTA uuid="1" compact />
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Add to Cart' } );
		expect( button ).toHaveTextContent( '' );
	} );

	it( 'should not show Continue text when compact prop is true', () => {
		render(
			<DomainSearch
				cart={ buildDomainSearchCart( {
					items: [ buildDomain( { uuid: '1' } ) ],
					hasItem: ( uuid ) => uuid === '1',
				} ) }
				onContinue={ jest.fn() }
			>
				<DomainSuggestionCTA uuid="1" compact />
			</DomainSearch>
		);

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		expect( button ).toHaveTextContent( '' );
	} );
} );
