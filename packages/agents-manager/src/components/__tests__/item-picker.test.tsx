/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import ItemPicker from '../pattern-picker/item-picker';

jest.mock( '../pattern-picker/item-preview', () => {
	const Mock = ( props: { item: { id: string }; index: number } ) => (
		<div data-testid="mock-item-preview" data-index={ props.index }>
			{ props.item.id }
		</div>
	);
	Mock.displayName = 'MockItemPreview';
	return { __esModule: true, default: Mock };
} );

jest.mock( '../../utils/template-parts', () => ( {
	isTemplatePartPatternSlug: ( slug: string ) => [ 'header', 'hero', 'footer' ].includes( slug ),
	TemplatePartPatternSlug: { Header: 'header', HeaderHero: 'hero', Footer: 'footer' },
} ) );

const mockScrollPrev = jest.fn();
const mockScrollNext = jest.fn();
const mockSelectedScrollSnap = jest.fn( () => 0 );
const mockCanScrollPrev = jest.fn( () => false );
const mockCanScrollNext = jest.fn( () => true );

jest.mock(
	'embla-carousel-react',
	() => ( {
		__esModule: true,
		default: () => [
			jest.fn(),
			{
				on: jest.fn(),
				off: jest.fn(),
				canScrollPrev: mockCanScrollPrev,
				canScrollNext: mockCanScrollNext,
				scrollPrev: mockScrollPrev,
				scrollNext: mockScrollNext,
				selectedScrollSnap: mockSelectedScrollSnap,
			},
		],
	} ),
	{ virtual: true }
);

const makeItem = ( id: string, category: string ) => ( {
	id,
	patterns: [ { category, blocks: [ { name: 'core/group', clientId: `block-${ id }` } ] } ],
} );

const mockItems = [ makeItem( '1', 'intro' ), makeItem( '2', 'services' ), makeItem( '3', 'cta' ) ];

describe( 'ItemPicker', () => {
	it( 'renders all item previews as slides', () => {
		render( <ItemPicker items={ mockItems } clientId="root" /> );
		expect( screen.getAllByTestId( 'mock-item-preview' ) ).toHaveLength( 3 );
	} );

	it( 'renders navigation arrows when multiple items exist', () => {
		const { container } = render( <ItemPicker items={ mockItems } clientId="root" /> );
		const arrows = container.querySelector( '.agents-manager-pattern-picker__arrows' );
		expect( arrows ).toBeInTheDocument();
		expect( arrows?.querySelectorAll( 'button' ) ).toHaveLength( 2 );
	} );

	it( 'does not render arrows for a single item', () => {
		const { container } = render( <ItemPicker items={ [ mockItems[ 0 ] ] } clientId="root" /> );
		expect(
			container.querySelector( '.agents-manager-pattern-picker__arrows' )
		).not.toBeInTheDocument();
	} );

	it( 'shows the pager with correct position', () => {
		const { container } = render( <ItemPicker items={ mockItems } clientId="root" /> );
		const pager = container.querySelector( '.agents-manager-pattern-picker__pager' );
		expect( pager ).toHaveTextContent( '1/3' );
	} );

	it( 'calls embla scrollNext on next click', () => {
		render( <ItemPicker items={ mockItems } clientId="root" /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );
		expect( mockScrollNext ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables prev button when embla cannot scroll prev', () => {
		mockCanScrollPrev.mockReturnValue( false );
		render( <ItemPicker items={ mockItems } clientId="root" /> );
		expect( screen.getByRole( 'button', { name: 'Previous' } ) ).toBeDisabled();
	} );

	it( 'renders nothing for empty items', () => {
		const { container } = render( <ItemPicker items={ [] } clientId="root" /> );
		expect( container.firstChild ).toBeNull();
	} );

	it( 'applies wider class for template-part categories', () => {
		const headerItems = [ makeItem( '1', 'header' ), makeItem( '2', 'header' ) ];
		const { container } = render( <ItemPicker items={ headerItems } clientId="root" /> );
		expect(
			container.querySelector( '.agents-manager-pattern-picker__slides--wider' )
		).toBeInTheDocument();
	} );
} );
