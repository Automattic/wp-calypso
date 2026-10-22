import { fireEvent, render, screen, within } from '@testing-library/react';
import { BASIC_CATALOG_ID } from '../../capabilities';
import { createInteractiveUiCatalog } from '../../utils/catalog';
import { createInteractiveUiRuntime } from '../../utils/runtime';
import { InteractiveUiSurface } from '../interactive-ui-surface';
import type { InteractiveUiRuntime } from '../../utils/runtime';

let runtime: InteractiveUiRuntime;

beforeEach( () => {
	runtime = createInteractiveUiRuntime( {
		catalogs: [ createInteractiveUiCatalog() ],
		onAction: jest.fn(),
		onError: jest.fn(),
	} );
} );

afterEach( () => runtime.dispose() );

function createSurface(
	components: ( { id: string; component: string } & Record< string, unknown > )[]
) {
	runtime.processMessages(
		[
			{ version: 'v1.0', createSurface: { surfaceId: 'surface', catalogId: BASIC_CATALOG_ID } },
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

it.each( [
	[ undefined, 'ai-ui-renderer' ],
	[ 'host a2ui-dark', 'ai-ui-renderer host a2ui-dark' ],
] )( 'adds className %p to the surface', ( className, expectedClassName ) => {
	const surface = createSurface( [ { id: 'root', component: 'Text', text: 'Hello' } ] );

	render( <InteractiveUiSurface surface={ surface } className={ className } /> );

	expect( screen.getByText( 'Hello' ).closest( 'fieldset' ) ).toHaveAttribute(
		'class',
		expectedClassName
	);
} );

it( 'themes the modal like its surface and disables its controls with the surface', async () => {
	const surface = createSurface( [
		{ id: 'root', component: 'Modal', trigger: 'trigger', content: 'input' },
		{ id: 'trigger', component: 'Button', child: 'label', action: { event: { name: 'open' } } },
		{ id: 'label', component: 'Text', text: 'Open details' },
		{ id: 'input', component: 'TextField', label: 'Name' },
	] );

	const { container, rerender } = render(
		<InteractiveUiSurface surface={ surface } className="host" />
	);
	const trigger = screen.getByRole( 'button', { name: 'Open details' } );
	const root = trigger.closest( 'fieldset' );

	root?.style.setProperty( '--a2ui-color-surface', 'black' );
	root?.style.setProperty( 'color-scheme', 'dark' );
	root?.style.setProperty( '--ai-ui-renderer-host-accent', 'green' );
	fireEvent.click( trigger );

	const dialog = await screen.findByRole( 'dialog', { name: 'Details' } );
	const overlay = dialog.closest< HTMLElement >( '.ai-ui-renderer__modal' );
	const input = within( dialog ).getByRole( 'textbox', { name: 'Name' } );

	expect( container ).not.toContainElement( dialog );
	expect( overlay ).toHaveClass( 'host' );
	expect( overlay?.style.getPropertyValue( '--a2ui-color-surface' ) ).toBe( 'black' );
	expect( overlay?.style.getPropertyValue( 'color-scheme' ) ).toBe( 'dark' );
	expect( overlay?.style.getPropertyValue( '--ai-ui-renderer-host-accent' ) ).toBe( 'green' );
	expect( input ).toBeEnabled();

	rerender( <InteractiveUiSurface surface={ surface } className="host" disabled /> );

	expect( trigger ).toBeDisabled();
	expect( input ).toBeDisabled();
} );
