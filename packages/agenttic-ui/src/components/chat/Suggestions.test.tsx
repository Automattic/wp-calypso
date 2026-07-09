// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import {
	type AgentUIContextValue,
	AgentUIProvider,
} from '../../context/AgentUIContext';
import { Suggestions } from './Suggestions';
import type { Suggestion } from '../../types';

(
	globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

// The dropdown branch renders a Radix Popover, which relies on browser APIs
// jsdom does not implement. Only needed for the description-wiring tests below.
beforeAll( () => {
	if ( ! HTMLElement.prototype.hasPointerCapture ) {
		HTMLElement.prototype.hasPointerCapture = () => false;
	}
	if (
		! ( globalThis as unknown as { ResizeObserver?: unknown } )
			.ResizeObserver
	) {
		(
			globalThis as unknown as { ResizeObserver: unknown }
		 ).ResizeObserver = class {
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
	reportSuggestionsRendered: ( shown: Suggestion[] ) => void
) =>
	( {
		variant,
		reportSuggestionsRendered,
	} ) as unknown as AgentUIContextValue;

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

const render = (
	variant: 'floating' | 'embedded',
	report: ( shown: Suggestion[] ) => void,
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

// Suggestions is intentionally dumb: it reports the truncated set to the context
// reporter whenever visible. Dedup lives in the container ( see Chat.test.tsx ).
describe( 'Suggestions reportSuggestionsRendered', () => {
	it( 'reports the full list when embedded', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions } );

		expect( report ).toHaveBeenCalledOnce();
		expect(
			report.mock.calls[ 0 ][ 0 ].map( ( s: Suggestion ) => s.id )
		).toEqual( [ 'a', 'b', 'c', 'd' ] );
	} );

	it( 'reports at most three when floating (after truncation)', () => {
		const report = vi.fn();
		render( 'floating', report, { suggestions } );

		expect( report ).toHaveBeenCalledOnce();
		expect(
			report.mock.calls[ 0 ][ 0 ].map( ( s: Suggestion ) => s.id )
		).toEqual( [ 'a', 'b', 'c' ] );
	} );

	it( 'does not fire while hidden', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions, visible: false } );

		expect( report ).not.toHaveBeenCalled();
	} );

	it( 'fires when it becomes visible', () => {
		const report = vi.fn();
		render( 'embedded', report, { suggestions, visible: false } );
		expect( report ).not.toHaveBeenCalled();

		render( 'embedded', report, { suggestions, visible: true } );
		expect( report ).toHaveBeenCalledOnce();
	} );

	it( 'reports the new set when the rendered set changes', () => {
		const report = vi.fn();
		render( 'embedded', report, {
			suggestions: suggestions.slice( 0, 2 ),
		} );
		render( 'embedded', report, { suggestions } );

		expect( report ).toHaveBeenCalledTimes( 2 );
		expect(
			report.mock.calls.map( ( [ shown ]: [ Suggestion[] ] ) =>
				shown.map( ( s ) => s.id )
			)
		).toEqual( [
			[ 'a', 'b' ],
			[ 'a', 'b', 'c', 'd' ],
		] );
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

		expect( container.textContent ).toContain(
			'Adjust the tone of your post.'
		);
	} );

	it( 'hides the dropdown description in horizontal layout', () => {
		render( 'embedded', vi.fn(), {
			suggestions: [ dropdownSuggestion ],
			layout: 'horizontal',
		} );

		expect( container.textContent ).not.toContain(
			'Adjust the tone of your post.'
		);
	} );
} );
