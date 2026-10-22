import { basicCatalog } from '@a2ui/react/v0_9';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createInteractiveUiCatalog } from '../catalog';
import { InteractiveUiSurface } from '../interactive-ui-surface';
import { createInteractiveUiRuntime } from '../runtime';
import type { InteractiveUiRuntime } from '../runtime';

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
	components: ( { id: string; component: string } & Record< string, unknown > )[],
	name?: string
) {
	runtime.processMessages(
		[
			{
				version: 'v0.9',
				createSurface: { surfaceId: 'surface', catalogId: basicCatalog.id, theme: { name } },
			},
			{ version: 'v0.9', updateComponents: { surfaceId: 'surface', components } },
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
	[ undefined, undefined, 'ai-ui-renderer' ],
	[ 'commerce', undefined, 'ai-ui-renderer ai-ui-renderer--theme-commerce' ],
	[ 'Commerce', undefined, 'ai-ui-renderer' ],
	[ 'Commerce', 'agents-manager', 'ai-ui-renderer ai-ui-renderer--theme-agents-manager' ],
] )( 'renders message theme %p with host theme %p', ( name, theme, expectedClassName ) => {
	const surface = createSurface( [ { id: 'root', component: 'Text', text: 'Hello' } ], name );
	render( <InteractiveUiSurface surface={ surface } theme={ theme } /> );

	expect( screen.getByText( 'Hello' ).closest( 'fieldset' ) ).toHaveAttribute(
		'class',
		expectedClassName
	);
} );

it( 'themes the modal overlay and content and disables its controls with the surface', async () => {
	const surface = createSurface(
		[
			{ id: 'root', component: 'Modal', trigger: 'trigger', content: 'input' },
			{
				id: 'trigger',
				component: 'Button',
				child: 'label',
				action: { event: { name: 'open' } },
			},
			{ id: 'label', component: 'Text', text: 'Open details' },
			{ id: 'input', component: 'TextField', label: 'Name' },
		],
		'commerce'
	);
	const { container, rerender } = render(
		<InteractiveUiSurface surface={ surface } theme="agents-manager" />
	);
	const trigger = screen.getByRole( 'button', { name: 'Open details' } );
	fireEvent.click( trigger );
	const dialog = await screen.findByRole( 'dialog', { name: 'Details' } );
	const input = within( dialog ).getByRole( 'textbox', { name: 'Name' } );

	expect( container ).not.toContainElement( dialog );
	expect( dialog.closest( '.ai-ui-renderer__modal' ) ).toHaveClass(
		'ai-ui-renderer--theme-agents-manager'
	);
	expect( input.closest( 'fieldset' ) ).toHaveClass( 'ai-ui-renderer--theme-agents-manager' );
	expect( input ).toBeEnabled();

	rerender( <InteractiveUiSurface surface={ surface } theme="agents-manager" disabled /> );

	expect( trigger ).toBeDisabled();
	expect( input ).toBeDisabled();
} );
