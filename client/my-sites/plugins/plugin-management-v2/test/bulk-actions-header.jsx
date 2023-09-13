/**
 * @jest-environment jsdom
 */

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslate } from 'i18n-calypso';
import BulkActionsHeader from '../bulk-actions-header';
import UpdatePlugins from '../update-plugins';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn(),
	translate: jest.fn(),
	localize: jest.fn(),
} ) );
jest.mock( '../update-plugins' );

const UPDATE_PLUGINS_ELEMENT_TEXT = 'Update Plugins Element';

describe( 'BulkActionsHeader', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		useTranslate.mockReturnValue( ( s ) => s );
		UpdatePlugins.mockImplementation( () => <span>Update Plugins Element</span> );
	} );

	it( 'shows a text placeholder when `isLoading` is true', () => {
		const { container } = render( <BulkActionsHeader isLoading /> );

		expect( container.children.length ).toBe( 1 );
		const [ child ] = Array.from( container.children );
		expect( child ).toBeEmptyDOMElement();
	} );

	it( 'shows a button labeled "Edit All" when loaded', () => {
		render( <BulkActionsHeader /> );

		expect( screen.getByText( 'Edit All', { role: 'button' } ) ).toBeInTheDocument();
	} );

	it( 'calls `onClickEditAll` when the "Edit All" button is clicked', async () => {
		const user = userEvent.setup();

		const onClickEditAll = jest.fn();
		render( <BulkActionsHeader onClickEditAll={ onClickEditAll } /> );

		const button = screen.getByText( 'Edit All', { role: 'button' } );
		await user.click( button );

		expect( onClickEditAll ).toHaveBeenCalled();
	} );

	it( 'does not show <UpdatePlugins /> when `showUpdatePlugins is false', () => {
		render( <BulkActionsHeader /> );
		expect( screen.queryByText( UPDATE_PLUGINS_ELEMENT_TEXT ) ).not.toBeInTheDocument();
	} );

	it( 'shows <UpdatePlugins /> when `showUpdatePlugins` is true', () => {
		render( <BulkActionsHeader showUpdatePlugins /> );
		expect( screen.getByText( UPDATE_PLUGINS_ELEMENT_TEXT ) ).toBeInTheDocument();
	} );
} );
