import { withComputedActions, withDisabledActions } from '../message-actions';
import type { UIMessageAction } from '@automattic/agenttic-client';

function action( id: string, order?: number ) {
	return { id, label: id, onClick: jest.fn(), order } as UIMessageAction;
}

describe( 'withComputedActions', () => {
	it( 'replaces a registered copy of a computed action with the fresh one', () => {
		const message = { actions: [ action( 'copy', 1 ), action( 'sources' ) ] };

		const { actions } = withComputedActions( message, [ action( 'copy', 3 ) ] );

		expect( actions?.map( ( { id, order } ) => [ id, order ] ) ).toEqual( [
			[ 'copy', 3 ],
			[ 'sources', undefined ],
		] );
	} );

	it( 'sorts actions by order, unordered last', () => {
		const message = { actions: [ action( 'sources' ) ] };

		const { actions } = withComputedActions( message, [
			action( 'copy', 3 ),
			action( 'feedback-up', 0 ),
		] );

		expect( actions?.map( ( { id } ) => id ) ).toEqual( [ 'feedback-up', 'copy', 'sources' ] );
	} );

	it( 'leaves a message without computed or checkpoint actions untouched', () => {
		const message = { actions: [ action( 'share' ) ] };

		expect( withComputedActions( message, [] ) ).toBe( message );
	} );
} );

describe( 'withDisabledActions', () => {
	it( 'disables button and component actions', () => {
		const component = {
			type: 'component',
			id: 'checkpoint',
			component: jest.fn(),
		} as UIMessageAction;

		const { actions } = withDisabledActions( { actions: [ action( 'feedback-up' ), component ] } );

		expect( actions ).toEqual( [
			expect.objectContaining( { id: 'feedback-up', disabled: true } ),
			expect.objectContaining( { id: 'checkpoint', componentProps: { disabled: true } } ),
		] );
	} );
} );
