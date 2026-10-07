// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type AgentUIContextValue, AgentUIProvider } from '../../context/AgentUIContext';
import { AgentUIChecklist } from '../composable/AgentUIChecklist';
import { Checklist } from './Checklist';
import type { ChecklistItem } from '../../types';

( globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

const items: ChecklistItem[] = [
	{ id: 'design', label: 'Customize the design', prompt: 'Customize the design', status: 'done' },
	{ id: 'about', label: 'Publish the About page', prompt: 'Publish the About page' },
	{
		id: 'images',
		label: 'Replace placeholder images',
		prompt: 'Replace images',
		status: 'in_progress',
	},
	{ id: 'domain', label: 'Add a custom domain', prompt: 'Add a domain', status: 'skipped' },
	{ id: 'launch', label: 'Launch site', prompt: 'Launch site' },
];

let container: HTMLDivElement;
let root: Root;

beforeEach( () => {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	root = createRoot( container );
} );

afterEach( () => {
	act( () => {
		root.unmount();
	} );
	container.remove();
} );

const render = ( props: Partial< React.ComponentProps< typeof Checklist > > = {} ) => {
	act( () => {
		root.render( <Checklist title="Launch checklist" items={ items } { ...props } /> );
	} );
};

// Folded rows stay mounted (so the collapse can animate) but leave the
// accessibility tree, which is what "visible" means here.
const rows = () =>
	Array.from( container.querySelectorAll( 'li' ) ).filter(
		( row ) => row.getAttribute( 'aria-hidden' ) !== 'true'
	);
const rowLabels = () => rows().map( ( row ) => row.querySelector( 'span' )?.textContent );
const header = () => container.querySelector( 'button[aria-expanded]' ) as HTMLButtonElement;
const rowFor = ( label: string ) => {
	const row = rows().find( ( candidate ) => candidate.textContent?.includes( label ) );
	if ( ! row ) {
		throw new Error( `No row found containing "${ label }".` );
	}
	return row;
};
const click = ( element: Element | null ) => {
	act( () => {
		( element as HTMLElement ).click();
	} );
};
const flush = async () => {
	await act( async () => {
		await Promise.resolve();
	} );
};

describe( 'Checklist', () => {
	it( 'counts settled items (done + skipped) in the badge', () => {
		render();

		expect( header().textContent ).toContain( '2/5' );
	} );

	it( 'shows every item while expanded', () => {
		render();

		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		expect( rowLabels() ).toEqual( items.map( ( item ) => item.label ) );
	} );

	it( 'shows only in-progress items while collapsed', () => {
		render( { defaultCollapsed: true } );

		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		expect( rowLabels() ).toEqual( [ 'Replace placeholder images' ] );
	} );

	it( 'toggles between the two from the header', () => {
		const onCollapsedChange = vi.fn();
		render( { onCollapsedChange } );

		click( header() );
		expect( rowLabels() ).toEqual( [ 'Replace placeholder images' ] );
		expect( onCollapsedChange ).toHaveBeenLastCalledWith( true );

		click( header() );
		expect( rowLabels() ).toHaveLength( 5 );
		expect( onCollapsedChange ).toHaveBeenLastCalledWith( false );
	} );

	it( 'submits an open item and collapses the list', async () => {
		const onSubmit = vi.fn();
		render( { onSubmit } );

		click( rowFor( 'Publish the About page' ).querySelector( 'button' ) );
		await flush();

		expect( onSubmit ).toHaveBeenCalledWith( items[ 1 ], items );
		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'moves focus to the header after a selection collapses the list', async () => {
		render( { onSubmit: vi.fn() } );

		const button = rowFor( 'Launch site' ).querySelector( 'button' ) as HTMLButtonElement;
		button.focus();
		click( button );
		await flush();

		expect( document.activeElement ).toBe( header() );
	} );

	it( 'keeps the list open when collapseOnSelect is false', async () => {
		render( { onSubmit: vi.fn(), collapseOnSelect: false } );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'renders settled and in-progress items without a button', () => {
		render();

		expect( rowFor( 'Customize the design' ).querySelector( 'button' ) ).toBeNull();
		expect( rowFor( 'Add a custom domain' ).querySelector( 'button' ) ).toBeNull();
		expect( rowFor( 'Replace placeholder images' ).querySelector( 'button' ) ).toBeNull();
		expect( rowFor( 'Publish the About page' ).querySelector( 'button' ) ).not.toBeNull();
	} );

	it( 'keeps a disabled item focusable and describes it by its reason', () => {
		const onSubmit = vi.fn();
		render( {
			onSubmit,
			items: [
				{
					id: 'woo',
					label: 'Add products',
					prompt: 'Add products',
					disabled: true,
					disabledReason: 'Install WooCommerce first',
				},
			],
		} );

		const button = rowFor( 'Add products' ).querySelector( 'button' ) as HTMLButtonElement;
		expect( button.getAttribute( 'aria-disabled' ) ).toBe( 'true' );
		const reasonId = button.getAttribute( 'aria-describedby' ) as string;
		expect( document.getElementById( reasonId )?.textContent ).toBe( 'Install WooCommerce first' );

		click( button );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'gives each checklist instance its own description ids', () => {
		const disabledItems: ChecklistItem[] = [
			{ id: 'woo', label: 'Add products', prompt: 'Add', disabled: true, disabledReason: 'Later' },
		];
		act( () => {
			root.render(
				<>
					<Checklist title="One" items={ disabledItems } />
					<Checklist title="Two" items={ disabledItems } />
				</>
			);
		} );

		const ids = Array.from( container.querySelectorAll( 'button[aria-describedby]' ) ).map( ( b ) =>
			b.getAttribute( 'aria-describedby' )
		);
		expect( ids ).toHaveLength( 2 );
		expect( new Set( ids ).size ).toBe( 2 );
	} );

	it( 'renders a disabled item that is in progress as an inert row', () => {
		render( {
			items: [
				{
					id: 'woo',
					label: 'Add products',
					prompt: 'Add products',
					status: 'in_progress',
					disabled: true,
					disabledReason: 'Install WooCommerce first',
				},
			],
		} );

		expect( rowFor( 'Add products' ).querySelector( 'button' ) ).toBeNull();
	} );

	it( 'announces each status to assistive technology', () => {
		render();

		expect( rowFor( 'Customize the design' ).textContent ).toContain( 'Done' );
		expect( rowFor( 'Replace placeholder images' ).textContent ).toContain( 'In progress' );
		expect( rowFor( 'Add a custom domain' ).textContent ).toContain( 'Skipped' );
		expect( rowFor( 'Launch site' ).textContent ).toContain( 'To do' );
	} );

	it( 'runs the action first and skips the submit when it returns false', async () => {
		const onSubmit = vi.fn();
		const action = vi.fn().mockResolvedValue( false );
		render( {
			onSubmit,
			items: [ { id: 'launch', label: 'Launch site', prompt: 'Launch', action } ],
		} );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( action ).toHaveBeenCalled();
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'does not collapse when the action cancels', async () => {
		const onSubmit = vi.fn();
		render( {
			onSubmit,
			items: [
				{ id: 'launch', label: 'Launch site', prompt: 'Launch', action: async () => false },
			],
		} );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( onSubmit ).not.toHaveBeenCalled();
		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'does not collapse when onSubmit reports the prompt was not sent', async () => {
		const onCollapsedChange = vi.fn();
		render( { onSubmit: () => false, onCollapsedChange } );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		expect( onCollapsedChange ).not.toHaveBeenCalled();
	} );

	it( 'ignores a second click while the action is still pending', async () => {
		let resolveAction: ( value: boolean ) => void = () => {};
		const action = vi.fn(
			() => new Promise< boolean >( ( resolve ) => ( resolveAction = resolve ) )
		);
		const onSubmit = vi.fn();
		render( {
			onSubmit,
			items: [ { id: 'launch', label: 'Launch site', prompt: 'Launch', action } ],
		} );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await act( async () => {
			resolveAction( true );
			await Promise.resolve();
		} );

		expect( action ).toHaveBeenCalledTimes( 1 );
		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'treats an item with only an action as actionable', async () => {
		const action = vi.fn().mockResolvedValue( true );
		render( { items: [ { id: 'launch', label: 'Launch site', action } ] } );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( action ).toHaveBeenCalled();
	} );

	it( 'follows a controlled collapsed prop', () => {
		const onCollapsedChange = vi.fn();
		render( { collapsed: true, onCollapsedChange } );

		click( header() );

		expect( onCollapsedChange ).toHaveBeenCalledWith( false );
		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );
} );

describe( 'AgentUIChecklist', () => {
	const launch: ChecklistItem = {
		id: 'go',
		label: 'Launch site',
		prompt: 'Launch',
		autoSubmit: true,
	};

	const renderWired = ( context: Partial< AgentUIContextValue >, onSelect = vi.fn() ) => {
		act( () => {
			root.render(
				<AgentUIProvider value={ context as AgentUIContextValue }>
					<AgentUIChecklist title="Launch checklist" items={ [ launch ] } onSelect={ onSelect } />
				</AgentUIProvider>
			);
		} );
		return onSelect;
	};

	it( 'routes a sent selection through the container and reports it', async () => {
		const handleSuggestionSubmit = vi.fn( () => true );
		const onSelect = renderWired( { handleSuggestionSubmit } );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( handleSuggestionSubmit ).toHaveBeenCalledWith( launch, [ launch ] );
		expect( onSelect ).toHaveBeenCalledWith( launch );
		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'keeps the item open when the container does not send', async () => {
		const handleSuggestionSubmit = vi.fn( () => false );
		const onSelect = renderWired( { handleSuggestionSubmit } );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( handleSuggestionSubmit ).toHaveBeenCalled();
		expect( onSelect ).not.toHaveBeenCalled();
		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'keeps the item open when the prompt only fills the composer', async () => {
		const handleSuggestionSubmit = vi.fn( () => false );
		const onSelect = vi.fn();
		act( () => {
			root.render(
				<AgentUIProvider value={ { handleSuggestionSubmit } as unknown as AgentUIContextValue }>
					<AgentUIChecklist
						title="Launch checklist"
						items={ [ { ...launch, autoSubmit: false } ] }
						onSelect={ onSelect }
					/>
				</AgentUIProvider>
			);
		} );

		click( rowFor( 'Launch site' ).querySelector( 'button' ) );
		await flush();

		expect( handleSuggestionSubmit ).toHaveBeenCalled();
		expect( onSelect ).not.toHaveBeenCalled();
		expect( header().getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );
} );
