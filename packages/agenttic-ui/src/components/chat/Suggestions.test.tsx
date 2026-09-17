// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { type AgentUIContextValue, AgentUIProvider } from '../../context/AgentUIContext';
import { Suggestions } from './Suggestions';
import type { Suggestion } from '../../types';

( globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

// The dropdown branch renders a Radix Popover, which relies on browser APIs
// jsdom does not implement. Only needed for the description-wiring tests below.
beforeAll( () => {
	if ( ! HTMLElement.prototype.hasPointerCapture ) {
		HTMLElement.prototype.hasPointerCapture = () => false;
	}
	if ( ! ( globalThis as unknown as { ResizeObserver?: unknown } ).ResizeObserver ) {
		( globalThis as unknown as { ResizeObserver: unknown } ).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	}
} );

const suggestions: Suggestion[] = [
	{ id: 'a', label: 'A', prompt: 'A' },
	{ id: 'b', label: 'B', prompt: 'B' },
	{ id: 'c', label: 'C', prompt: 'C' },
	{ id: 'd', label: 'D', prompt: 'D' },
];

const makeContext = (
	variant: 'floating' | 'embedded',
	reportSuggestionsRendered: ( instanceId: string, shown: Suggestion[] | null ) => void
) =>
	( {
		variant,
		reportSuggestionsRendered,
	} ) as unknown as AgentUIContextValue;

let container: HTMLDivElement;
let root: Root;

// Throws rather than returning undefined: a missing chip would otherwise turn
// every click into a no-op and let a negative assertion pass vacuously.
const getButton = ( label: string ): HTMLButtonElement => {
	const button = Array.from( container.querySelectorAll( 'button' ) ).find(
		( candidate ) => candidate.textContent?.includes( label )
	);
	if ( ! button ) {
		throw new Error( `No button found containing "${ label }".` );
	}
	return button;
};

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

const render = (
	variant: 'floating' | 'embedded',
	report: ( instanceId: string, shown: Suggestion[] | null ) => void,
	props: React.ComponentProps< typeof Suggestions >
) => {
	act( () => {
		root.render(
			<AgentUIProvider value={ makeContext( variant, report ) }>
				<Suggestions { ...props } />
			</AgentUIProvider>
		);
	} );
};

// Suggestions is intentionally dumb: it registers the truncated set with the
// context reporter whenever it renders — empty while hidden, null on unmount.
// Dedup and the union across instances live in the container ( see
// AgentUIContainer.test.tsx ).
describe( 'Suggestions reportSuggestionsRendered', () => {
	const reported = ( report: ReturnType< typeof vi.fn > ) =>
		report.mock.calls.map( ( call ) => {
			const shown = call[ 1 ] as Suggestion[] | null;
			return shown === null ? null : shown.map( ( s ) => s.id );
		} );

	it( 'reports the full list when embedded', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions } );

		expect( reported( report ) ).toEqual( [ [ 'a', 'b', 'c', 'd' ] ] );
	} );

	it( 'reports at most three when floating (after truncation)', () => {
		const report = vi.fn();
		render( 'floating', report, { suggestions } );

		expect( reported( report ) ).toEqual( [ [ 'a', 'b', 'c' ] ] );
	} );

	it( 'reports an empty set while hidden', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions, visible: false } );

		expect( reported( report ) ).toEqual( [ [] ] );
	} );

	it( 'reports the set once it becomes visible', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions, visible: false } );
		render( 'embedded', report, { suggestions, visible: true } );

		expect( reported( report ) ).toEqual( [ [], [ 'a', 'b', 'c', 'd' ] ] );
	} );

	it( 'reports the new set when the rendered set changes', () => {
		const report = vi.fn();
		render( 'embedded', report, {
			suggestions: suggestions.slice( 0, 2 ),
		} );
		render( 'embedded', report, { suggestions } );

		expect( reported( report ) ).toEqual( [
			[ 'a', 'b' ],
			[ 'a', 'b', 'c', 'd' ],
		] );
	} );

	it( 'keeps one instance id across re-renders and unregisters on unmount', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions: suggestions.slice( 0, 2 ) } );
		render( 'embedded', report, { suggestions } );
		act( () => {
			root.render( null );
		} );

		const instanceIds = new Set( report.mock.calls.map( ( call ) => call[ 0 ] ) );
		expect( instanceIds.size ).toBe( 1 );
		expect( reported( report ) ).toEqual( [ [ 'a', 'b' ], [ 'a', 'b', 'c', 'd' ], null ] );
	} );
} );

// Proves the caller path: Suggestions passes showDescription to the dropdown
// only in non-horizontal layouts (isEligibleForDescription).
describe( 'Suggestions dropdown description wiring', () => {
	const dropdownSuggestion: Suggestion = {
		id: 'tone',
		label: 'Change tone to',
		prompt: 'Change the tone to ',
		description: 'Adjust the tone of your post.',
		options: [ { id: 'formal', label: 'Formal', value: 'formal' } ],
	};

	it( 'renders the dropdown description in vertical layout', () => {
		render( 'embedded', vi.fn(), {
			suggestions: [ dropdownSuggestion ],
			layout: 'vertical',
		} );

		expect( container.textContent ).toContain( 'Adjust the tone of your post.' );
	} );

	it( 'hides the dropdown description in horizontal layout', () => {
		render( 'embedded', vi.fn(), {
			suggestions: [ dropdownSuggestion ],
			layout: 'horizontal',
		} );

		expect( container.textContent ).not.toContain( 'Adjust the tone of your post.' );
	} );
} );

describe( 'Suggestions disabled', () => {
	const dropdownSuggestion: Suggestion = {
		id: 'seo',
		label: 'SEO Enhancer',
		prompt: '',
		options: [ { id: 'title', label: 'Title', value: 'Write a title' } ],
	};

	it( 'renders a plain suggestion as a disabled button', () => {
		render( 'embedded', vi.fn(), {
			suggestions: [ { id: 'a', label: 'A', prompt: 'A', disabled: true } ],
		} );

		expect( getButton( 'A' ).getAttribute( 'aria-disabled' ) ).toBe( 'true' );
	} );

	it( 'renders a dropdown suggestion as a disabled trigger', () => {
		render( 'embedded', vi.fn(), {
			suggestions: [ { ...dropdownSuggestion, disabled: true } ],
		} );

		expect( getButton( 'SEO Enhancer' ).getAttribute( 'aria-disabled' ) ).toBe( 'true' );
	} );

	it( 'runs neither the action nor the submit for a disabled suggestion', async () => {
		const action = vi.fn( () => true );
		const onSubmit = vi.fn();
		render( 'embedded', vi.fn(), {
			suggestions: [ { id: 'a', label: 'A', prompt: 'A', action, disabled: true } ],
			onSubmit,
		} );

		await act( async () => {
			getButton( 'A' ).click();
		} );

		expect( action ).not.toHaveBeenCalled();
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'does not open the option list of a disabled dropdown', async () => {
		const onDropdownOpenChange = vi.fn();
		render( 'embedded', vi.fn(), {
			suggestions: [ { ...dropdownSuggestion, disabled: true } ],
			onDropdownOpenChange,
		} );

		await act( async () => {
			getButton( 'SEO Enhancer' ).click();
		} );

		expect( onDropdownOpenChange ).not.toHaveBeenCalledWith( true );
		expect( container.textContent ).not.toContain( 'Title' );
	} );
} );

describe( 'Suggestions disabled tooltip', () => {
	const disabledWithReason: Suggestion = {
		id: 'a',
		label: 'A',
		prompt: 'A',
		disabled: true,
		disabledReason: 'Add content first.',
	};

	it( 'keeps a disabled chip focusable so the tooltip is reachable', () => {
		render( 'embedded', vi.fn(), { suggestions: [ disabledWithReason ] } );

		// A real `disabled` button leaves the tab order, so a tooltip could never
		// reach a keyboard user.
		expect( getButton( 'A' ).disabled ).toBe( false );
		expect( getButton( 'A' ).tabIndex ).not.toBe( -1 );
		expect( getButton( 'A' ).getAttribute( 'aria-disabled' ) ).toBe( 'true' );
	} );

	// SEO Enhancer is this shape in production: a dropdown, gated on empty
	// content, carrying a reason. It also nests a Radix popover trigger inside a
	// Radix tooltip trigger, which fails quietly when it breaks.
	it( 'describes a disabled dropdown trigger and keeps its list shut', async () => {
		const onDropdownOpenChange = vi.fn();
		render( 'embedded', vi.fn(), {
			suggestions: [
				{
					id: 'seo',
					label: 'SEO Enhancer',
					prompt: '',
					options: [ { id: 'title', label: 'Title', value: 'Write a title' } ],
					disabled: true,
					disabledReason: 'Add content first.',
				},
			],
			onDropdownOpenChange,
		} );

		const describedBy = getButton( 'SEO Enhancer' ).getAttribute( 'aria-describedby' );
		expect( describedBy ).toBeTruthy();
		expect( document.getElementById( describedBy as string )?.textContent ).toBe(
			'Add content first.'
		);

		await act( async () => {
			getButton( 'SEO Enhancer' ).click();
		} );

		expect( onDropdownOpenChange ).not.toHaveBeenCalledWith( true );
		expect( container.textContent ).not.toContain( 'Title' );
	} );

	it( 'describes the disabled chip itself, not its wrapper', () => {
		render( 'embedded', vi.fn(), { suggestions: [ disabledWithReason ] } );

		// Radix describes its trigger, and only while the tooltip is open, so the
		// reason has to hang off the button for assistive technology and touch.
		const describedBy = getButton( 'A' ).getAttribute( 'aria-describedby' );
		expect( describedBy ).toBeTruthy();
		expect( document.getElementById( describedBy as string )?.textContent ).toBe(
			'Add content first.'
		);
	} );

	it( 'leaves an enabled chip undescribed even when it carries a stale reason', () => {
		render( 'embedded', vi.fn(), {
			suggestions: [ { id: 'a', label: 'A', prompt: 'A', disabledReason: 'Unused.' } ],
		} );

		expect( getButton( 'A' ).getAttribute( 'aria-disabled' ) ).toBeNull();
		expect( getButton( 'A' ).getAttribute( 'aria-describedby' ) ).toBeNull();
		expect( document.body.textContent ).not.toContain( 'Unused.' );
	} );
} );
