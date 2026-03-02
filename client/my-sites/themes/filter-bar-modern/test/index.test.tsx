/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBarModern from '../index';

// Mock CategoryPillNavigation to avoid its internal dependencies (LocalizedLink, Redux, etc.)
const mockOnSelect = jest.fn();
jest.mock( 'calypso/components/category-pill-navigation', () => ( {
	CategoryPillNavigation: ( {
		categories,
		selectedCategoryId,
		onSelect,
	}: {
		categories: Array< { id: string; label: string; link: string } >;
		selectedCategoryId: string;
		onSelect: ( id: string ) => void;
	} ) => {
		mockOnSelect.mockImplementation( onSelect );
		return (
			<div data-testid="category-pill-navigation">
				{ categories.map( ( category ) => (
					<button
						key={ category.id }
						onClick={ () => onSelect( category.id ) }
						className={ category.id === selectedCategoryId ? 'is-active' : '' }
					>
						{ category.label }
					</button>
				) ) }
			</div>
		);
	},
} ) );

// Mock CustomSelectWrapper to avoid SSR/WP component dependencies
jest.mock( 'calypso/my-sites/themes/custom-select-wrapper', () => ( {
	CustomSelectWrapper: ( {
		options,
		value,
		onChange,
		label,
		className,
	}: {
		options: Array< { key: string; name: string } >;
		value: { key: string; name: string };
		onChange: ( attrs: { selectedItem: { key: string; name: string } } ) => void;
		label: string;
		className: string;
		hideLabelFromVision?: boolean;
		__next40pxDefaultSize?: boolean;
	} ) => (
		<div data-testid="tier-select" className={ className }>
			<label>{ label }</label>
			<select
				value={ value.key }
				onChange={ ( e ) => {
					const tier = options.find( ( t ) => t.key === e.target.value );
					if ( tier ) {
						onChange( { selectedItem: tier } );
					}
				} }
			>
				{ options.map( ( option ) => (
					<option key={ option.key } value={ option.key }>
						{ option.name }
					</option>
				) ) }
			</select>
		</div>
	),
} ) );

describe( 'FilterBarModern', () => {
	const defaultProps = {
		categories: [
			{ key: 'recommended', text: 'Recommended' },
			{ key: 'all', text: 'All' },
			{ key: 'blog', text: 'Blog' },
		],
		selectedCategory: 'recommended',
		onCategorySelect: jest.fn(),
		tiers: [
			{ key: 'all', name: 'All' },
			{ key: 'free', name: 'Free' },
			{ key: 'premium', name: 'Premium' },
		],
		selectedTier: 'all',
		onTierSelect: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders category pills via CategoryPillNavigation', () => {
		render( <FilterBarModern { ...defaultProps } /> );
		expect( screen.getByTestId( 'category-pill-navigation' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Recommended' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'All' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Blog' } ) ).toBeVisible();
	} );

	test( 'calls onCategorySelect when a pill is clicked', async () => {
		const user = userEvent.setup();
		render( <FilterBarModern { ...defaultProps } /> );
		await user.click( screen.getByRole( 'button', { name: 'Blog' } ) );
		expect( defaultProps.onCategorySelect ).toHaveBeenCalledWith(
			expect.objectContaining( { key: 'blog' } )
		);
	} );

	test( 'renders tier dropdown when showTierFilter is true', () => {
		render( <FilterBarModern { ...defaultProps } showTierFilter /> );
		expect( screen.getByTestId( 'tier-select' ) ).toBeVisible();
	} );

	test( 'hides tier dropdown when showTierFilter is false', () => {
		render( <FilterBarModern { ...defaultProps } showTierFilter={ false } /> );
		expect( screen.queryByTestId( 'tier-select' ) ).not.toBeInTheDocument();
	} );

	test( 'renders tier dropdown by default', () => {
		render( <FilterBarModern { ...defaultProps } /> );
		expect( screen.getByTestId( 'tier-select' ) ).toBeVisible();
	} );

	test( 'calls onTierSelect when tier changes', async () => {
		const user = userEvent.setup();
		render( <FilterBarModern { ...defaultProps } /> );
		await user.selectOptions( screen.getByRole( 'combobox' ), 'free' );
		expect( defaultProps.onTierSelect ).toHaveBeenCalledWith( {
			selectedItem: expect.objectContaining( { key: 'free', name: 'Free' } ),
		} );
	} );
} );
