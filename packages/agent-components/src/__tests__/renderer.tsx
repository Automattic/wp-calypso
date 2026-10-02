import { fireEvent, render, screen } from '@testing-library/react';
import { SurfaceRenderer } from '../renderer';
import { useComponentSession } from '../use-component-session';
import { applied, completed, opening } from './fixtures';

describe( 'SurfaceRenderer', () => {
	it( 'renders proposal as plain text and emits only the named action', () => {
		const result = opening();
		result.surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: { text: '<script>alert(1)</script>' },
		};
		const onAction = jest.fn();
		const { container, rerender } = render(
			<SurfaceRenderer surface={ result.surface } onAction={ onAction } />
		);
		expect( screen.getByText( '<script>alert(1)</script>' ) ).toBeVisible();
		expect( container.querySelector( 'script' ) ).toBeNull();
		fireEvent.click( screen.getByRole( 'button', { name: 'Activate Example Plugin' } ) );
		expect( onAction ).toHaveBeenCalledWith( 'tool.execute' );
		rerender( <SurfaceRenderer surface={ result.surface } disabled onAction={ onAction } /> );
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( onAction ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'uses the same session across rerenders and removes the completed button', async () => {
		const transport = jest.fn().mockResolvedValue( applied() );
		const onContinue = jest.fn().mockResolvedValue( undefined );
		function Confirmation() {
			const session = useComponentSession( {
				result: opening(),
				transport,
				onContinue,
				createRequestId: () => 'request-123',
			} );
			if ( ! session.result ) {
				return null;
			}
			return (
				<SurfaceRenderer
					surface={ session.result.surface }
					disabled={ session.phase !== 'ready' }
					onAction={ session.submit }
				/>
			);
		}
		const { rerender } = render( <Confirmation /> );
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		expect( await screen.findByText( completed().summary ) ).toBeVisible();
		rerender( <Confirmation /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );
} );
