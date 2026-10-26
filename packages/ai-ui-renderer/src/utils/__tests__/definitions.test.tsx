import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { lazy } from '@wordpress/element';
import { InteractiveUiSurface } from '../../components/interactive-ui-surface';
import { createInteractiveUiCatalog } from '../catalog';
import { createInteractiveUiRuntime } from '../runtime';
import type { InteractiveUiMessage } from '../../index';
import type { InteractiveUiCatalogDefinition } from '../definitions';
import type { ComponentType } from 'react';

const HOST_CATALOG_ID = 'urn:host:catalog:v1';

interface GreetingProps {
	name: string;
	onGreet: () => void;
	surfaceId: string;
	disabled: boolean;
	isShowingErrors: boolean;
	isValid?: boolean;
	validationErrors?: string[];
}

function HostGreeting( { name, onGreet, surfaceId, disabled, isShowingErrors }: GreetingProps ) {
	return (
		<button
			type="button"
			onClick={ onGreet }
			data-surface-id={ surfaceId }
			data-disabled={ disabled }
			data-showing-errors={ isShowingErrors }
		>
			{ `Hi ${ name }` }
		</button>
	);
}

function createHostCatalog( {
	runHost = jest.fn(),
	hostRunDocument = {},
	greeting = HostGreeting,
}: {
	runHost?: jest.Mock;
	hostRunDocument?: object;
	greeting?: ComponentType< GreetingProps >;
} ): InteractiveUiCatalogDefinition {
	return {
		catalog: {
			catalogId: HOST_CATALOG_ID,
			components: {
				HostGreeting: {
					type: 'object',
					properties: {
						name: { $ref: 'common_types.json#/$defs/DynamicString' },
						onGreet: { $ref: 'common_types.json#/$defs/Action' },
						checks: { type: 'array', items: { $ref: 'common_types.json#/$defs/CheckRule' } },
					},
					required: [ 'name', 'onGreet' ],
				},
			},
			functions: {
				hostRun: {
					type: 'object',
					returnType: 'void',
					properties: { '@call': { const: 'hostRun' } },
					...hostRunDocument,
				},
			},
		},
		components: { HostGreeting: greeting },
		functions: { hostRun: runHost },
	};
}

function renderSurface(
	components: InteractiveUiMessage[],
	{
		runHost,
		hostRunDocument,
		greeting,
		hostProps,
		disabled,
	}: {
		runHost?: jest.Mock;
		hostRunDocument?: object;
		greeting?: ComponentType< GreetingProps >;
		hostProps?: Record< string, unknown >;
		disabled?: boolean;
	} = {}
) {
	const onAction = jest.fn();
	const onError = jest.fn();
	const runtime = createInteractiveUiRuntime( {
		catalogs: [
			createInteractiveUiCatalog( createHostCatalog( { runHost, hostRunDocument, greeting } ) ),
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

	render(
		<InteractiveUiSurface surface={ surface } hostProps={ hostProps } disabled={ disabled } />
	);

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

function CheckedGreeting( { isValid, validationErrors = [] }: GreetingProps ) {
	return <p data-valid={ String( isValid ) }>{ validationErrors.join( ' ' ) }</p>;
}

it( 'gives a host component its checks’ result', async () => {
	const { onError } = renderSurface(
		[
			updateComponents( {
				component: 'HostGreeting',
				name: 'Ada',
				onGreet: { event: { name: 'greet' } },
				checks: [ { condition: { '@path': '/ok' }, message: 'Not ok.' } ],
			} ),
		],
		{ greeting: CheckedGreeting }
	);

	expect( await screen.findByText( 'Not ok.' ) ).toHaveAttribute( 'data-valid', 'false' );
	expect( onError ).not.toHaveBeenCalled();
} );

it( 'gives a host component its surface ID and the surface’s disabled and error state', async () => {
	renderSurface(
		[
			updateComponents( {
				component: 'HostGreeting',
				name: 'Ada',
				onGreet: { event: { name: 'greet' } },
			} ),
		],
		{ disabled: true }
	);

	const button = await screen.findByRole( 'button', { name: 'Hi Ada' } );

	expect( button ).toHaveAttribute( 'data-surface-id', 'surface' );
	expect( button ).toHaveAttribute( 'data-disabled', 'true' );
	expect( button ).toHaveAttribute( 'data-showing-errors', 'false' );
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

it( 'shows the rest of its surface while a lazy host component loads', async () => {
	type GreetingModule = { default: typeof HostGreeting };
	let load: ( module: GreetingModule ) => void = () => {};

	const { onError } = renderSurface(
		[
			updateComponents(
				{ component: 'Column', children: [ 'title', 'greeting' ] },
				{ id: 'title', component: 'Text', text: 'Welcome' },
				{
					id: 'greeting',
					component: 'HostGreeting',
					name: 'Ada',
					onGreet: { event: { name: 'greet' } },
				}
			),
		],
		{ greeting: lazy( () => new Promise< GreetingModule >( ( resolve ) => ( load = resolve ) ) ) }
	);

	await screen.findByText( 'Welcome' );
	expect( screen.queryByRole( 'button' ) ).toBeNull();

	load( { default: HostGreeting } );

	expect( await screen.findByRole( 'button', { name: 'Hi Ada' } ) ).toBeVisible();
	expect( onError ).not.toHaveBeenCalled();
} );

it( 'hides a surface with a component its catalog lacks, and reports it', async () => {
	const { onError } = renderSurface( [ updateComponents( { component: 'HostMissing' } ) ] );

	await waitFor( () =>
		expect( onError ).toHaveBeenCalledWith(
			expect.objectContaining( { code: 'UNKNOWN_COMPONENT_TYPE', surfaceId: 'surface' } ),
			'message'
		)
	);

	expect( screen.queryByText( /Unknown component type/ ) ).toBeNull();
} );

describe( 'host functions', () => {
	const button = updateComponents(
		{ component: 'Button', child: 'label', action: { functionCall: { '@call': 'hostRun' } } },
		{ id: 'label', component: 'Text', text: 'Run' }
	);

	it( 'runs when a Button calls it, instead of sending an action', async () => {
		const runHost = jest.fn();
		const { onAction } = renderSurface( [ button ], { runHost } );

		fireEvent.click( await screen.findByRole( 'button', { name: 'Run' } ) );

		expect( runHost ).toHaveBeenCalled();
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
		const { onError } = renderSurface( [ button ], { runHost: jest.fn( execute ) } );

		fireEvent.click( await screen.findByRole( 'button', { name: 'Run' } ) );

		await waitFor( () =>
			expect( onError ).toHaveBeenCalledWith(
				expect.objectContaining( { surfaceId: 'surface', message: 'Failed' } ),
				'message'
			)
		);
	} );

	it( 'never runs from a component’s value by default, only from a click', async () => {
		const runHost = jest.fn();
		const { onError } = renderSurface(
			[
				updateComponents( {
					component: 'HostGreeting',
					name: { '@call': 'hostRun' },
					onGreet: { event: { name: 'greet' } },
				} ),
			],
			{ runHost }
		);

		await waitFor( () =>
			expect( onError ).toHaveBeenCalledWith(
				expect.objectContaining( { code: 'EXPRESSION_ERROR', surfaceId: 'surface' } ),
				'message'
			)
		);

		expect( runHost ).not.toHaveBeenCalled();
	} );

	it( 'runs from a component’s value when its document allows it', async () => {
		renderSurface(
			[
				updateComponents( {
					component: 'HostGreeting',
					name: { '@call': 'hostRun', returnType: 'string' },
					onGreet: { event: { name: 'greet' } },
				} ),
			],
			{
				runHost: jest.fn( () => 'Ada' ),
				hostRunDocument: { returnType: 'string', requiresUserActivation: false },
			}
		);

		expect( await screen.findByRole( 'button', { name: 'Hi Ada' } ) ).toBeVisible();
	} );
} );
