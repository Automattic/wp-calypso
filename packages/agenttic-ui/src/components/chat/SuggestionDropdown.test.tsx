// eslint-disable-next-line jsdoc/check-tag-names -- Vitest environment directive
/** @vitest-environment jsdom */
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SuggestionDropdown } from './SuggestionDropdown';
import type { Suggestion } from '../../types';

// Required for React 18's `act` to flush effects (Radix relies on this).
(
	globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

// Radix Popover relies on browser APIs that jsdom does not implement.
beforeAll( () => {
	if ( ! HTMLElement.prototype.hasPointerCapture ) {
		HTMLElement.prototype.hasPointerCapture = () => false;
	}
	if ( ! HTMLElement.prototype.setPointerCapture ) {
		HTMLElement.prototype.setPointerCapture = () => {};
	}
	if ( ! HTMLElement.prototype.releasePointerCapture ) {
		HTMLElement.prototype.releasePointerCapture = () => {};
	}
	if ( ! HTMLElement.prototype.scrollIntoView ) {
		HTMLElement.prototype.scrollIntoView = () => {};
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

// Radix Trigger opens on pointerdown (left button); jsdom's `.click()` alone
// does not fire pointer events, so tests synthesize the full sequence.
const pressTrigger = ( trigger: HTMLElement ) => {
	trigger.dispatchEvent(
		new MouseEvent( 'pointerdown', { bubbles: true, button: 0 } )
	);
	trigger.dispatchEvent(
		new MouseEvent( 'mousedown', { bubbles: true, button: 0 } )
	);
	trigger.dispatchEvent(
		new MouseEvent( 'pointerup', { bubbles: true, button: 0 } )
	);
	trigger.click();
};

const mockSuggestion: Suggestion = {
	id: 'tone',
	label: 'Change tone to',
	prompt: 'Change the tone to ',
	options: [
		{ id: 'formal', label: 'Formal', value: 'formal' },
		{ id: 'casual', label: 'Casual', value: 'casual' },
		{ id: 'funny', label: 'Funny', value: 'funny' },
	],
};

const allSuggestions: Suggestion[] = [
	mockSuggestion,
	{ id: 'other', label: 'Other suggestion', prompt: 'Other' },
];

let wrapper: HTMLDivElement;
let container: HTMLDivElement;
let root: Root;

beforeEach( () => {
	// Most tests wrap in .agenttic so the preferred portal target can be found.
	wrapper = document.createElement( 'div' );
	wrapper.className = 'agenttic';
	container = document.createElement( 'div' );
	wrapper.appendChild( container );
	document.body.appendChild( wrapper );
	root = createRoot( container );
} );

afterEach( () => {
	act( () => {
		root.unmount();
	} );
	wrapper.remove();
} );

const getTrigger = () =>
	container.querySelector< HTMLButtonElement >( '[aria-haspopup="dialog"]' )!;

const getOptions = () =>
	wrapper.querySelectorAll< HTMLButtonElement >(
		'[data-slot="suggestion-option"]'
	);

const getOptionByText = ( text: string ) =>
	Array.from( getOptions() ).find( ( el ) => el.textContent === text );

describe( 'SuggestionDropdown', () => {
	it( 'renders the trigger button with the suggestion label', () => {
		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		expect( getTrigger().textContent ).toContain( 'Change tone to' );
	} );

	it( 'shows options when clicked', () => {
		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		expect( getOptions().length ).toBe( 3 );
		expect( getOptionByText( 'Formal' ) ).toBeTruthy();
		expect( getOptionByText( 'Casual' ) ).toBeTruthy();
		expect( getOptionByText( 'Funny' ) ).toBeTruthy();
	} );

	it( 'shows options without an .agenttic wrapper', () => {
		wrapper.className = '';

		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		expect( getOptions().length ).toBe( 3 );
		expect( getOptionByText( 'Formal' ) ).toBeTruthy();
	} );

	it( 'calls onSelect with the combined prompt when an option is selected', async () => {
		const onSelect = vi.fn();

		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					onSelect={ onSelect }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		await act( async () => {
			getOptionByText( 'Formal' )!.click();
		} );

		expect( onSelect ).toHaveBeenCalledOnce();
		const [ combinedSuggestion, availableSugs ] = onSelect.mock.calls[ 0 ];
		expect( combinedSuggestion.prompt ).toBe( 'Change the tone to formal' );
		expect( combinedSuggestion.options ).toBeUndefined();
		expect( availableSugs ).toBe( allSuggestions );
	} );

	it( 'adds boundary whitespace when joining a prompt and option value', async () => {
		const onSelect = vi.fn();
		const suggestionWithoutTrailingSpace: Suggestion = {
			id: 'link',
			label: 'Edit link',
			prompt: 'Change the button link to:',
			options: [ { id: 'blue', label: 'Blue', value: 'blue' } ],
		};

		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ suggestionWithoutTrailingSpace }
					onSelect={ onSelect }
					availableSuggestions={ [] }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		await act( async () => {
			getOptionByText( 'Blue' )!.click();
		} );

		expect( onSelect.mock.calls[ 0 ][ 0 ].prompt ).toBe(
			'Change the button link to: blue'
		);
	} );

	it( 'closes the dropdown after selecting an option', async () => {
		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					onSelect={ vi.fn() }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );
		expect( getOptions().length ).toBe( 3 );

		await act( async () => {
			getOptionByText( 'Formal' )!.click();
		} );

		expect( getOptions().length ).toBe( 0 );
	} );

	it( 'notifies open state changes after toggling and selecting', async () => {
		const onOpenChange = vi.fn();

		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					availableSuggestions={ allSuggestions }
					onOpenChange={ onOpenChange }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		expect( onOpenChange ).toHaveBeenLastCalledWith( true );

		await act( async () => {
			getOptionByText( 'Formal' )!.click();
		} );

		expect( onOpenChange ).toHaveBeenLastCalledWith( false );
	} );

	it( 'preserves the suggestion action on the combined suggestion so the parent can run it', async () => {
		const action = vi.fn().mockResolvedValue( true );
		const onSelect = vi.fn();
		const suggestionWithAction: Suggestion = {
			...mockSuggestion,
			action,
		};

		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ suggestionWithAction }
					onSelect={ onSelect }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		await act( async () => {
			getOptionByText( 'Casual' )!.click();
		} );

		// The dropdown itself must not invoke the action — action handling
		// lives in the parent (Suggestions) so the flow matches regular
		// (non-dropdown) suggestions.
		expect( action ).not.toHaveBeenCalled();
		expect( onSelect ).toHaveBeenCalledOnce();
		expect( onSelect.mock.calls[ 0 ][ 0 ].action ).toBe( action );
	} );

	it( 'toggles the dropdown open and closed', () => {
		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ mockSuggestion }
					availableSuggestions={ allSuggestions }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );
		expect( getOptions().length ).toBe( 3 );

		act( () => {
			pressTrigger( getTrigger() );
		} );
		expect( getOptions().length ).toBe( 0 );
	} );

	it( 'uses the label as prompt when no prompt is set', async () => {
		const onSelect = vi.fn();
		const suggestionNoPrompt: Suggestion = {
			id: 'no-prompt',
			label: 'Tone:',
			options: [ { id: 'opt', label: 'Pro', value: 'Professional' } ],
		};

		act( () => {
			root.render(
				<SuggestionDropdown
					suggestion={ suggestionNoPrompt }
					onSelect={ onSelect }
					availableSuggestions={ [] }
				/>
			);
		} );

		act( () => {
			pressTrigger( getTrigger() );
		} );

		await act( async () => {
			getOptionByText( 'Pro' )!.click();
		} );

		expect( onSelect.mock.calls[ 0 ][ 0 ].prompt ).toBe(
			'Tone: Professional'
		);
	} );
} );
