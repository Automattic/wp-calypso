/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { opening } from '../../utils/__tests__/fixtures/component-opening';
import ComponentCard from '../component-card';
import type { SurfaceRendererProps } from '@automattic/agent-components';

let mockFail = false;
jest.mock( '@automattic/agent-components', () => {
	const actual = jest.requireActual< typeof import( '@automattic/agent-components' ) >(
		'@automattic/agent-components'
	);
	return {
		...actual,
		SurfaceRenderer: ( props: SurfaceRendererProps ) => {
			if ( mockFail ) {
				throw new Error( 'Presentation failed.' );
			}
			return actual.SurfaceRenderer( props );
		},
	};
} );

it( 'keeps the approved completion readable and continues once after a pending renderer failure', async () => {
	const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	let resolve: ( value: unknown ) => void = () => {};
	const transport = jest.fn(
		() =>
			new Promise< unknown >( ( done ) => {
				resolve = done;
			} )
	);
	const onContinue = jest.fn().mockResolvedValue( undefined );
	mockFail = false;
	render(
		<ComponentCard
			options={ { result: opening(), transport, onContinue, createRequestId: () => 'request-123' } }
		/>
	);
	mockFail = true;
	fireEvent.click( screen.getByRole( 'button' ) );
	expect( screen.getByText( opening().summary ) ).toBeVisible();
	const completed = {
		...opening(),
		revision: 2,
		status: 'completed',
		summary: 'Example Plugin is active on Example Site.',
	};
	completed.surface.components = {
		root: { id: 'root', type: 'Column', children: [ 'proposal' ] },
		proposal: {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: { text: completed.summary },
		},
	};
	await act( async () => {
		resolve( {
			protocol: 'agent-component/0.1',
			requestId: 'request-123',
			outcome: 'applied',
			current: {
				protocol: 'agent-component/0.1',
				instanceId: completed.instanceId,
				resolvedLocale: 'en-US',
				state: 'completed',
				revision: 2,
				allowedActions: [],
				expiresAt: new Date( Date.now() + 30 * 60 * 1000 ).toISOString(),
				request: { state: 'settled', requestId: 'request-123', outcome: 'applied', revision: 2 },
				result: completed,
			},
		} );
	} );
	expect( screen.getByText( completed.summary ) ).toBeVisible();
	expect( transport ).toHaveBeenCalledTimes( 1 );
	expect( onContinue ).toHaveBeenCalledTimes( 1 );
	expect( onContinue ).toHaveBeenCalledWith( completed.summary );
	consoleError.mockRestore();
} );
