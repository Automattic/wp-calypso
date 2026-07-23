/**
 * @jest-environment jsdom
 */
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useFields } from '../use-fields';
import type { Plugin } from 'calypso/state/plugins/installed/types';

const pluginWithoutUpdate = {
	status: [],
} as unknown as Plugin;

const getUpdateField = ( isListView: boolean ) => {
	const { result } = renderHookWithProvider( () => useFields( jest.fn(), jest.fn(), isListView ) );

	return result.current.find( ( field: { id: string } ) => field.id === 'update' );
};

describe( 'useFields', () => {
	test( 'does not render the update value in list view', () => {
		const updateField = getUpdateField( true );

		expect( updateField?.render?.( { item: pluginWithoutUpdate } ) ).toBeNull();
	} );

	test( 'renders the negative update value in table view', () => {
		const updateField = getUpdateField( false );

		expect( updateField?.render?.( { item: pluginWithoutUpdate } ) ).toBe( 'No' );
	} );
} );
