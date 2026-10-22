import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InteractiveUiSurface } from '../../components/interactive-ui-surface';
import { createInteractiveUiCatalog } from '../catalog';
import { createInteractiveUiRuntime } from '../runtime';
import type { InteractiveUiMessage } from '../../index';
import type {
	InteractiveUiComponentDefinition,
	InteractiveUiFunctionDefinition,
} from '../definitions';

const HOST_CATALOG_ID = 'urn:host:catalog:v1';

interface GreetingProps {
	name: string;
	onGreet: () => void;
}

const greeting: InteractiveUiComponentDefinition< GreetingProps > = {
	name: 'HostGreeting',
	schema: ( { z, ActionSchema, StringValueSchema } ) =>
		z.object( { name: StringValueSchema, onGreet: ActionSchema } ),
	component: ( { name, onGreet } ) => (
		<button type="button" onClick={ onGreet }>
			{ `Hi ${ name }` }
		</button>
	),
};

function renderSurface(
	components: InteractiveUiMessage[],
	{
		functions = [],
		hostProps,
	}: { functions?: InteractiveUiFunctionDefinition[]; hostProps?: Record< string, unknown > } = {}
) {
	const onAction = jest.fn();
	const onError = jest.fn();
	const runtime = createInteractiveUiRuntime( {
		catalogs: [
			createInteractiveUiCatalog( { id: HOST_CATALOG_ID, components: [ greeting ], functions } ),
		],
		onAction,
		onError,
	} );

	runtime.processMessages(
		[
			{ version: 'v1.0', createSurface: { surfaceId: 'surface', catalogId: HOST_CATALOG_ID } },
			...components,
		],
		'message'
	);

	const surface = runtime.getSurface( 'surface' );

	if ( ! surface ) {
		throw new Error( 'The surface was not created.' );
	}

	render( <InteractiveUiSurface surface={ surface } hostProps={ hostProps } /> );

	return { onAction, onError };
}

type ComponentJson = { id: string; component: string } & Record< string, unknown >;

function updateComponents(
	root: Omit< ComponentJson, 'id' >,
	...children: ComponentJson[]
): InteractiveUiMessage {
	return {
		version: 'v1.0',
		updateComponents: {
			surfaceId: 'surface',
			components: [ { id: 'root', ...root }, ...children ],
		},
	};
}

it( 'renders a host component with its bound values resolved and its action callable', async () => {
	const { onAction } = renderSurface( [
		updateComponents( {
			component: 'HostGreeting',
			name: { '@path': '/name' },
			onGreet: { event: { name: 'greet' } },
		} ),
		{ version: 'v1.0', updateDataModel: { surfaceId: 'surface', path: '/name', value: 'Ada' } },
	] );

	fireEvent.click( await screen.findByRole( 'button', { name: 'Hi Ada' } ) );

	expect( onAction ).toHaveBeenCalledWith(
		expect.objectContaining( { name: 'greet', surfaceId: 'surface' } )
	);
} );

it( 'gives a host component the host’s props over the surface’s', async () => {
	renderSurface(
		[
			updateComponents( {
				component: 'HostGreeting',
				name: 'Ada',
				onGreet: { event: { name: 'greet' } },
			} ),
		],
		{ hostProps: { name: 'Host' } }
	);

	expect( await screen.findByRole( 'button' ) ).toHaveTextContent( 'Hi Host' );
} );

it( 'hides a surface with a component its catalog lacks, and reports it', async () => {
	const { onError } = renderSurface( [ updateComponents( { component: 'HostMissing' } ) ] );

	await waitFor( () =>
		expect( onError ).toHaveBeenCalledWith(
			expect.objectContaining( { code: 'UNKNOWN_COMPONENT_TYPE', surfaceId: 'surface' } )
		)
	);

	expect( screen.queryByText( /Unknown component type/ ) ).toBeNull();
} );

describe( 'host functions', () => {
	function createHostRun( execute: () => unknown ): InteractiveUiFunctionDefinition {
		return { name: 'hostRun', returnType: 'void', schema: ( { z } ) => z.object( {} ), execute };
	}

	const button = updateComponents(
		{ component: 'Button', child: 'label', action: { functionCall: { '@call': 'hostRun' } } },
		{ id: 'label', component: 'Text', text: 'Run' }
	);

	it( 'runs when a Button calls it, instead of sending an action', async () => {
		const execute = jest.fn();
		const { onAction } = renderSurface( [ button ], { functions: [ createHostRun( execute ) ] } );

		fireEvent.click( await screen.findByRole( 'button', { name: 'Run' } ) );

		expect( execute ).toHaveBeenCalled();
		expect( onAction ).not.toHaveBeenCalled();
	} );

	it.each( [
		[
			'throws',
			() => {
				throw new Error( 'Failed' );
			},
		],
		[ 'rejects', () => Promise.reject( new Error( 'Failed' ) ) ],
	] )( 'reports a failure when it %s', async ( _description, execute ) => {
		const { onError } = renderSurface( [ button ], { functions: [ createHostRun( execute ) ] } );

		fireEvent.click( await screen.findByRole( 'button', { name: 'Run' } ) );

		await waitFor( () =>
			expect( onError ).toHaveBeenCalledWith(
				expect.objectContaining( { surfaceId: 'surface', message: 'Failed' } )
			)
		);
	} );

	it( 'never runs from a component’s value, only from a click', () => {
		const execute = jest.fn();
		const valueCallingFunction = updateComponents( {
			component: 'HostGreeting',
			name: { '@call': 'hostRun' },
			onGreet: { event: { name: 'greet' } },
		} );

		expect( () =>
			renderSurface( [ valueCallingFunction ], { functions: [ createHostRun( execute ) ] } )
		).toThrow( "Validation failed for component 'HostGreeting'" );

		expect( execute ).not.toHaveBeenCalled();
	} );
} );
