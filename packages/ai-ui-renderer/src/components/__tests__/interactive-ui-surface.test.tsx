import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { BASIC_CATALOG_ID, LAYOUT_CATALOG_ID } from '../../capabilities';
import { LAYOUT_CATALOG, createInteractiveUiCatalog } from '../../utils/catalog';
import { createInteractiveUiRuntime } from '../../utils/runtime';
import { InteractiveUiSurface } from '../interactive-ui-surface';
import type { InteractiveUiRuntime } from '../../utils/runtime';

const CRASHING_CATALOG_ID = 'urn:test:crashing:v1';

const crashingCatalog = createInteractiveUiCatalog( {
	catalog: { catalogId: CRASHING_CATALOG_ID, components: { Crashing: { type: 'object' } } },
	components: {
		Crashing: () => {
			throw new Error( 'Crashed' );
		},
	},
} );

let runtime: InteractiveUiRuntime;
let onAction: Mock;
let onError: Mock;

// JSDOM lacks PointerEvent, which UI uses when activating choice controls.
beforeAll( () => {
	Object.defineProperty( window, 'PointerEvent', { value: MouseEvent, configurable: true } );
} );

beforeEach( () => {
	onAction = vi.fn();
	onError = vi.fn();

	runtime = createInteractiveUiRuntime( {
		catalogs: [ createInteractiveUiCatalog(), crashingCatalog ],
		onAction,
		onError,
	} );
} );

afterEach( () => runtime.dispose() );

it.each( [ 'agent', 'tool-call' ] as const )(
	'dispatches edited arguments in %s mode',
	async ( actionMode ) => {
		runtime.dispose();
		runtime = createInteractiveUiRuntime( {
			catalogs: [ createInteractiveUiCatalog() ],
			onError,
			actionMode,
			onAction,
		} );
		const surface = createSurface( [
			{ id: 'root', component: 'Column', children: [ 'name', 'save' ] },
			{ id: 'name', component: 'TextField', label: 'Name', value: { '@path': '/name' } },
			{
				id: 'save',
				component: 'Button',
				child: 'label',
				action: { event: { name: 'save_name', context: { name: { '@path': '/name' } } } },
			},
			{ id: 'label', component: 'Text', text: 'Save' },
		] );

		render( <InteractiveUiSurface surface={ surface } /> );
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Name' } ), {
			target: { value: 'Ada' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () =>
			expect( onAction.mock.calls ).toEqual( [
				[ expect.objectContaining( { name: 'save_name', context: { name: 'Ada' } } ) ],
			] )
		);
		expect( onError ).not.toHaveBeenCalled();
	}
);

function createSurface(
	components: ( { id: string; component: string } & Record< string, unknown > )[],
	catalogId = BASIC_CATALOG_ID
) {
	runtime.processMessages(
		[
			{ version: 'v1.0', createSurface: { surfaceId: 'surface', catalogId } },
			{ version: 'v1.0', updateComponents: { surfaceId: 'surface', components } },
		],
		'message'
	);

	const surface = runtime.getSurface( 'surface' );

	if ( ! surface ) {
		throw new Error( 'The surface was not created.' );
	}

	return surface;
}

it.each( [ 'resolve', 'reject' ] as const )(
	'keeps only the activated button busy until its action %ss',
	async ( outcome ) => {
		runtime.dispose();
		runtime = createInteractiveUiRuntime( {
			catalogs: [ createInteractiveUiCatalog() ],
			actionMode: 'tool-call',
			onAction,
			onError,
		} );
		let resolve!: () => void;
		let reject!: ( error: Error ) => void;
		onAction.mockReturnValue(
			new Promise< void >( ( done, fail ) => {
				resolve = done;
				reject = fail;
			} )
		);
		const surface = createSurface( [
			{ id: 'root', component: 'Column', children: [ 'save', 'other' ] },
			{ id: 'save', component: 'Button', child: 'label', action: { event: { name: 'save' } } },
			{ id: 'label', component: 'Text', text: 'Save' },
			{
				id: 'other',
				component: 'Button',
				child: 'otherLabel',
				action: { event: { name: 'other' } },
			},
			{ id: 'otherLabel', component: 'Text', text: 'Other' },
		] );
		const { rerender } = render( <InteractiveUiSurface surface={ surface } /> );
		expect( onError ).not.toHaveBeenCalled();
		const button = screen.getByRole( 'button', { name: 'Save' } );
		fireEvent.click( button );
		rerender( <InteractiveUiSurface surface={ surface } disabled /> );
		expect( button ).toHaveAttribute( 'aria-busy', 'true' );
		expect( screen.getByRole( 'button', { name: 'Other' } ) ).not.toHaveAttribute( 'aria-busy' );
		fireEvent.click( button );
		await waitFor( () => expect( onAction ).toHaveBeenCalledTimes( 1 ) );

		await act( async () => {
			if ( outcome === 'resolve' ) {
				resolve();
			} else {
				reject( new Error( 'Request failed' ) );
			}
		} );
		await waitFor( () => expect( button ).not.toHaveAttribute( 'aria-busy' ) );
		rerender( <InteractiveUiSurface surface={ surface } /> );
		expect( button ).not.toHaveAttribute( 'aria-disabled', 'true' );
		expect( onError ).toHaveBeenCalledTimes( outcome === 'reject' ? 1 : 0 );
	}
);

it( 'preserves edited action arguments inside nested shared layouts', async () => {
	runtime.dispose();
	runtime = createInteractiveUiRuntime( {
		catalogs: [ createInteractiveUiCatalog( LAYOUT_CATALOG ) ],
		onAction,
		onError,
	} );
	const surface = createSurface(
		[
			{ id: 'root', component: 'Grid', children: [ 'form' ] },
			{ id: 'form', component: 'Stack', children: [ 'name', 'save' ] },
			{ id: 'name', component: 'TextField', label: 'Name', value: { '@path': '/name' } },
			{
				id: 'save',
				component: 'Button',
				child: 'label',
				action: { event: { name: 'save', context: { name: { '@path': '/name' } } } },
			},
			{ id: 'label', component: 'Text', text: 'Save' },
		],
		LAYOUT_CATALOG_ID
	);

	render( <InteractiveUiSurface surface={ surface } hostProps={ { buildChild: () => null } } /> );
	fireEvent.change( screen.getByRole( 'textbox', { name: 'Name' } ), { target: { value: 'Ada' } } );
	fireEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

	await waitFor( () =>
		expect( onAction ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'save', context: { name: 'Ada' } } )
		)
	);
	expect( onError ).not.toHaveBeenCalled();
} );

it.each( [
	[ undefined, 'ai-ui-renderer' ],
	[ 'host a2ui-dark', 'ai-ui-renderer host a2ui-dark' ],
] )( 'adds className %o to the surface', ( className, expectedClassName ) => {
	const surface = createSurface( [ { id: 'root', component: 'Text', text: 'Hello' } ] );

	render( <InteractiveUiSurface surface={ surface } className={ className } /> );

	expect( screen.getByText( 'Hello' ).closest( '.ai-ui-renderer' ) ).toHaveAttribute(
		'class',
		expectedClassName
	);
} );

it.each( [
	[ undefined, 'is-outline' ],
	[ 'primary', 'is-solid' ],
	[ 'borderless', 'is-minimal' ],
] )( 'renders a Button with variant %o as WordPress’s %s Button', ( variant, className ) => {
	const surface = createSurface( [
		{ id: 'root', component: 'Button', child: 'label', action: { event: { name: 'go' } }, variant },
		{ id: 'label', component: 'Text', text: 'Go' },
	] );

	render( <InteractiveUiSurface surface={ surface } /> );

	expect( screen.getByRole( 'button', { name: 'Go' } ).className ).toContain( `__${ className }` );
	expect( onError ).not.toHaveBeenCalled();
} );

it( 'keeps an open modal in sync with its surface theme', async () => {
	const surface = createSurface( [
		{ id: 'root', component: 'Modal', trigger: 'trigger', content: 'details' },
		{ id: 'trigger', component: 'Button', child: 'label', action: { event: { name: 'open' } } },
		{ id: 'label', component: 'Text', text: 'Open details' },
		{ id: 'details', component: 'Text', text: 'Details' },
	] );

	const { container, rerender } = render(
		<InteractiveUiSurface surface={ surface } className="host" theme="chatgpt" />
	);
	const trigger = screen.getByRole( 'button', { name: 'Open details' } );
	const root = trigger.closest< HTMLElement >( '.ai-ui-renderer' );

	root?.style.setProperty( '--a2ui-color-surface', 'black' );
	root?.style.setProperty( 'color-scheme', 'dark' );
	root?.style.setProperty( '--ai-ui-renderer-host-accent', 'green' );
	fireEvent.click( trigger );

	const dialog = await screen.findByRole( 'dialog', { name: 'Details' } );
	const overlay = dialog.closest< HTMLElement >( '.ai-ui-renderer__modal' );

	expect( container ).not.toContainElement( dialog );
	expect( overlay ).toHaveClass( 'host' );
	expect( overlay?.style.getPropertyValue( '--a2ui-color-surface' ) ).toBe( 'black' );
	expect( overlay?.style.getPropertyValue( 'color-scheme' ) ).toBe( 'dark' );
	expect( overlay?.style.getPropertyValue( '--ai-ui-renderer-host-accent' ) ).toBe( 'green' );

	root?.style.setProperty( '--a2ui-color-surface', 'white' );
	root?.style.setProperty( 'color-scheme', 'light' );
	root?.style.setProperty( '--ai-ui-theme-control-radius', '12px' );
	rerender( <InteractiveUiSurface surface={ surface } className="host" theme="another-client" /> );

	await waitFor( () => {
		expect( overlay ).toHaveAttribute( 'data-ai-ui-theme', 'another-client' );
		expect( overlay?.style.getPropertyValue( '--a2ui-color-surface' ) ).toBe( 'white' );
		expect( overlay?.style.getPropertyValue( 'color-scheme' ) ).toBe( 'light' );
		expect( overlay?.style.getPropertyValue( '--ai-ui-theme-control-radius' ) ).toBe( '12px' );
	} );

	root?.style.removeProperty( '--ai-ui-theme-control-radius' );
	await waitFor( () =>
		expect( overlay?.style.getPropertyValue( '--ai-ui-theme-control-radius' ) ).toBe( '' )
	);
} );

it( 'titles a modal with its accessibility label', async () => {
	const surface = createSurface( [
		{
			id: 'root',
			component: 'Modal',
			trigger: 'trigger',
			content: 'address',
			accessibility: { label: 'Edit address' },
		},
		{ id: 'trigger', component: 'Button', child: 'label', action: { event: { name: 'open' } } },
		{ id: 'label', component: 'Text', text: 'Edit' },
		{ id: 'address', component: 'Text', text: '1 Main St' },
	] );

	render( <InteractiveUiSurface surface={ surface } /> );

	fireEvent.click( screen.getByRole( 'button', { name: 'Edit' } ) );

	expect( await screen.findByRole( 'dialog', { name: 'Edit address' } ) ).toBeVisible();
} );

it( 'shows an AudioPlayer’s description as its name', () => {
	const surface = createSurface( [
		{
			id: 'root',
			component: 'AudioPlayer',
			url: 'https://example.com/a.mp3',
			description: 'Intro',
		},
	] );

	render( <InteractiveUiSurface surface={ surface } /> );

	expect( screen.getByText( 'Intro' ) ).toBeVisible();
	expect( screen.getByLabelText( 'Intro' ) ).toHaveAttribute( 'src', 'https://example.com/a.mp3' );
} );

it( 'moves a Slider without `steps` in whole numbers', () => {
	const surface = createSurface( [
		{ id: 'root', component: 'Slider', label: 'Volume', max: 100, value: 50 },
	] );

	render( <InteractiveUiSurface surface={ surface } /> );

	[
		screen.getByRole( 'slider', { name: 'Volume' } ),
		screen.getByRole( 'spinbutton', { name: 'Volume' } ),
	].forEach( ( input ) => expect( input ).toHaveAttribute( 'step', '1' ) );
} );

it( 'disables a disabled surface’s inputs and actions, but not its tabs or modal', async () => {
	const surface = createSurface( [
		{
			id: 'root',
			component: 'Tabs',
			tabs: [
				{ title: 'Edit', child: 'edit' },
				{ title: 'More', child: 'more' },
			],
		},
		{
			id: 'edit',
			component: 'Column',
			children: [ 'agree', 'size', 'topics', 'volume', 'date', 'save' ],
		},
		{ id: 'agree', component: 'CheckBox', label: 'Agree', value: false },
		{
			id: 'size',
			component: 'ChoicePicker',
			label: 'Size',
			options: [ { label: 'Small', value: 'small' } ],
			value: [],
		},
		{
			id: 'topics',
			component: 'ChoicePicker',
			label: 'Topics',
			variant: 'multipleSelection',
			options: [ { label: 'News', value: 'news' } ],
			value: [],
		},
		{ id: 'volume', component: 'Slider', label: 'Volume', max: 10, value: 0 },
		{ id: 'date', component: 'DateTimeInput', label: 'Date', enableDate: true, value: '' },
		{ id: 'save', component: 'Button', child: 'save_label', action: { event: { name: 'save' } } },
		{ id: 'save_label', component: 'Text', text: 'Save' },
		{ id: 'more', component: 'Modal', trigger: 'trigger', content: 'name' },
		{
			id: 'trigger',
			component: 'Button',
			child: 'trigger_label',
			action: { event: { name: 'open' } },
		},
		{ id: 'trigger_label', component: 'Text', text: 'Open details' },
		{ id: 'name', component: 'TextField', label: 'Name' },
	] );

	render( <InteractiveUiSurface surface={ surface } disabled /> );

	[
		screen.getByRole( 'checkbox', { name: 'Agree' } ),
		screen.getByRole( 'radio', { name: 'Small' } ),
		screen.getByRole( 'checkbox', { name: 'News' } ),
	].forEach( ( input ) => expect( input ).toHaveAttribute( 'aria-disabled', 'true' ) );

	[
		screen.getByRole( 'slider', { name: 'Volume' } ),
		screen.getByRole( 'spinbutton', { name: 'Volume' } ),
		screen.getByLabelText( 'Date' ),
	].forEach( ( input ) => expect( input ).toBeDisabled() );

	const save = screen.getByRole( 'button', { name: 'Save' } );

	expect( save ).toHaveAttribute( 'aria-disabled', 'true' );

	fireEvent.click( save );

	expect( onAction ).not.toHaveBeenCalled();

	fireEvent.click( screen.getByRole( 'tab', { name: 'More' } ) );

	const trigger = screen.getByRole( 'button', { name: 'Open details' } );

	expect( trigger ).toBeVisible();
	expect( trigger ).toBeEnabled();

	fireEvent.click( trigger );

	const dialog = await screen.findByRole( 'dialog', { name: 'Details' } );

	expect( within( dialog ).getByRole( 'textbox', { name: 'Name' } ) ).toBeDisabled();
} );

it( 'shows the fallback instead of a surface with a component its catalog lacks', () => {
	const surface = createSurface( [ { id: 'root', component: 'Missing' } ] );

	render( <InteractiveUiSurface surface={ surface } fallback="Couldn’t show this." /> );

	expect( screen.getByText( 'Couldn’t show this.' ) ).toBeVisible();
} );

it( 'shows the fallback when a surface fails to render, and reports it', async () => {
	const consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	const surface = createSurface( [ { id: 'root', component: 'Crashing' } ], CRASHING_CATALOG_ID );

	render( <InteractiveUiSurface surface={ surface } fallback="Couldn’t show this." /> );

	expect( await screen.findByText( 'Couldn’t show this.' ) ).toBeVisible();
	expect( onError ).toHaveBeenCalledWith(
		{ code: 'RENDER_FAILED', message: 'Crashed', surfaceId: 'surface' },
		'message'
	);

	consoleError.mockRestore();
} );

it( 'shows nothing, not the fallback, while the root component hasn’t arrived', () => {
	const surface = createSurface( [ { id: 'label', component: 'Text', text: 'Hello' } ] );

	const { container } = render(
		<InteractiveUiSurface surface={ surface } fallback="Couldn’t show this." />
	);

	expect( container ).toBeEmptyDOMElement();
} );

describe( 'checks', () => {
	const required = ( path: string ) => ( {
		condition: { '@call': 'required', args: { value: { '@path': path } } },
		message: 'Fill this in.',
	} );

	it( 'disables a Button while its own checks fail', async () => {
		const surface = createSurface( [
			{ id: 'root', component: 'Column', children: [ 'name', 'save' ] },
			{ id: 'name', component: 'TextField', label: 'Name', value: { '@path': '/name' } },
			{
				id: 'save',
				component: 'Button',
				child: 'label',
				action: { event: { name: 'save' } },
				checks: [ required( '/name' ) ],
			},
			{ id: 'label', component: 'Text', text: 'Save' },
		] );

		render( <InteractiveUiSurface surface={ surface } /> );

		const save = screen.getByRole( 'button', { name: 'Save' } );

		expect( save ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( save ).toHaveAccessibleDescription( 'Fill this in.' );
		expect( onError ).not.toHaveBeenCalled();

		fireEvent.click( save );

		expect( onAction ).not.toHaveBeenCalled();

		fireEvent.change( screen.getByRole( 'textbox', { name: 'Name' } ), {
			target: { value: 'Ada' },
		} );

		await waitFor( () => expect( save ).not.toHaveAttribute( 'aria-disabled', 'true' ) );
		expect( save ).not.toHaveAccessibleDescription();

		fireEvent.click( save );

		expect( onAction ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'save', surfaceId: 'surface' } )
		);
	} );

	it.each( [
		[ 'clicks', ( button: HTMLElement ) => fireEvent.click( button ) ],
		[
			'presses Enter on',
			( button: HTMLElement ) => fireEvent.keyDown( button, { key: 'Enter' } ),
		],
	] )(
		'shows every field’s failed check once the person %s a Button whose checks fail',
		async ( _action, activate ) => {
			const surface = createSurface( [
				{ id: 'root', component: 'Column', children: [ 'name', 'save' ] },
				{
					id: 'name',
					component: 'TextField',
					label: 'Name',
					value: { '@path': '/name' },
					checks: [ required( '/name' ) ],
				},
				{
					id: 'save',
					component: 'Button',
					child: 'label',
					action: { event: { name: 'save' } },
					checks: [ required( '/name' ) ],
				},
				{ id: 'label', component: 'Text', text: 'Save' },
			] );

			render( <InteractiveUiSurface surface={ surface } /> );

			const name = screen.getByRole( 'textbox', { name: 'Name' } );

			expect( name ).not.toHaveAccessibleDescription();

			activate( screen.getByRole( 'button', { name: 'Save' } ) );

			await waitFor( () => expect( name ).toHaveAccessibleDescription( 'Fill this in.' ) );
			expect( name ).toHaveFocus();
			expect( onAction ).not.toHaveBeenCalled();
		}
	);

	it.each( [
		[ 'CheckBox', { label: 'Agree' }, 'checkbox' ],
		[ 'ChoicePicker', { options: [ { label: 'News', value: 'news' } ] }, 'radio' ],
	] )(
		'shows a %s’s failed check without changing it once the person presses Space on a Button whose checks fail',
		async ( component, props, role ) => {
			const surface = createSurface( [
				{ id: 'root', component: 'Column', children: [ 'field', 'save' ] },
				{
					id: 'field',
					component,
					...props,
					value: { '@path': '/value' },
					checks: [ required( '/value' ) ],
				},
				{
					id: 'save',
					component: 'Button',
					child: 'label',
					action: { event: { name: 'save' } },
					checks: [ required( '/value' ) ],
				},
				{ id: 'label', component: 'Text', text: 'Save' },
			] );

			render( <InteractiveUiSurface surface={ surface } /> );

			const field = screen.getByRole( role );
			const save = screen.getByRole( 'button', { name: 'Save' } );

			save.focus();
			fireEvent.keyDown( save, { key: ' ' } );
			// The browser sends the keyup to whatever has focus by then.
			fireEvent.keyUp( document.activeElement as HTMLElement, { key: ' ' } );

			await waitFor( () => expect( field ).toHaveAccessibleDescription( 'Fill this in.' ) );
			expect( field ).toHaveFocus();
			expect( field ).not.toBeChecked();
			expect( onAction ).not.toHaveBeenCalled();
		}
	);

	it.each( [
		[ 'TextField', { label: 'Name' } ],
		[ 'DateTimeInput', { label: 'Date', enableDate: true } ],
	] )( 'shows a %s’s first failed check once the person leaves it', async ( component, props ) => {
		const surface = createSurface( [
			{
				id: 'root',
				component,
				...props,
				value: { '@path': '/value' },
				checks: [ required( '/value' ), { condition: { '@path': '/ready' }, message: 'Not yet.' } ],
			},
		] );

		render( <InteractiveUiSurface surface={ surface } /> );

		const input = screen.getByLabelText( props.label );

		expect( input ).not.toHaveAccessibleDescription();

		fireEvent.blur( input );

		await waitFor( () => expect( input ).toHaveAccessibleDescription( 'Fill this in.' ) );
		expect( input ).toBeInvalid();
	} );

	it( 'clears a DateTimeInput’s browser error once the date becomes valid', async () => {
		const surface = createSurface( [
			{
				id: 'root',
				component: 'DateTimeInput',
				label: 'Date',
				enableDate: true,
				min: '2026-01-10',
				value: { '@path': '/date' },
			},
		] );

		render( <InteractiveUiSurface surface={ surface } /> );

		const input = screen.getByLabelText( 'Date' );

		fireEvent.change( input, { target: { value: '2026-01-01' } } );
		fireEvent.blur( input );

		await waitFor( () =>
			expect( input ).toHaveAccessibleDescription( 'Constraints not satisfied' )
		);
		expect( input ).toBeInvalid();

		fireEvent.input( input, { target: { value: '2026-01-15' } } );

		await waitFor( () => expect( input ).not.toHaveAccessibleDescription() );
		expect( input ).toBeValid();
	} );

	it.each( [
		[ 'CheckBox', { label: 'Agree', value: false }, 'checkbox', fireEvent.click ],
		[
			'ChoicePicker',
			{ options: [ { label: 'News', value: 'news' } ], value: [] },
			'radio',
			fireEvent.click,
		],
		[
			'Slider',
			{ label: 'Size', max: 10, value: 0 },
			'slider',
			( control: HTMLElement ) => fireEvent.change( control, { target: { value: '5' } } ),
		],
	] )(
		'marks a %s invalid, with its check’s message, once the person changes it',
		async ( component, props, role, change ) => {
			const surface = createSurface( [
				{
					id: 'root',
					component,
					...props,
					checks: [ { condition: { '@path': '/ready' }, message: 'Not yet.' } ],
				},
			] );

			render( <InteractiveUiSurface surface={ surface } /> );

			const control = screen.getByRole( role );

			expect( control ).toBeValid();

			change( control );

			await waitFor( () => expect( control ).toBeInvalid() );
			expect( control ).toHaveAccessibleDescription( 'Not yet.' );
		}
	);

	it( 'shows a multiple-selection picker’s failed check once the person changes it', async () => {
		const surface = createSurface( [
			{
				id: 'root',
				component: 'ChoicePicker',
				label: 'Topics',
				variant: 'multipleSelection',
				options: [ { label: 'News', value: 'news' } ],
				value: { '@path': '/topics' },
				checks: [ required( '/topics' ) ],
			},
		] );

		render( <InteractiveUiSurface surface={ surface } /> );

		const topics = screen.getByRole( 'group', { name: 'Topics' } );
		const news = screen.getByRole( 'checkbox', { name: 'News' } );

		expect( topics ).not.toHaveAccessibleDescription();

		fireEvent.click( news );
		fireEvent.click( news );

		await waitFor( () => expect( topics ).toHaveAccessibleDescription( 'Fill this in.' ) );
		expect( news ).toBeInvalid();
		expect( news ).toHaveAccessibleDescription( 'Fill this in.' );
	} );
} );
