/**
 * @jest-environment jsdom
 */

jest.mock( '../update-plugins' );
jest.mock( '../bulk-actions-header' );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
} ) );
jest.mock( '../plugins-list' );

import { render, screen } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { resetPluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import PluginManagementV2 from '..';
import PluginsList from '../plugins-list';

const MOCK_PLUGINSLIST_TEXT = 'PluginsList';
const MOCK_DISPATCH = jest.fn().mockReturnValue( ( action ) => action );

describe( 'PluginManagementV2', () => {
	beforeEach( () => {
		jest.resetAllMocks();

		useDispatch.mockReturnValue( MOCK_DISPATCH );
		// eslint-disable-next-line no-unused-vars
		PluginsList.mockImplementation( ( props ) => <span>PluginsList</span> );
	} );

	it( 'resets all statuses when it unmounts', () => {
		const { unmount } = render( <PluginManagementV2 plugins={ [] } filter="all" /> );
		unmount();

		expect( MOCK_DISPATCH ).toHaveBeenCalledWith( resetPluginStatuses() );
	} );

	it( 'does not render when there is a request error', () => {
		const { container } = render( <PluginManagementV2 requestError plugins={ [] } filter="all" /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders only an empty message when the list of plugins is empty', () => {
		const { container } = render( <PluginManagementV2 plugins={ [] } filter="all" /> );
		expect( container.children.length ).toBe( 1 );

		expect( screen.queryByText( 'No plugins found.' ) ).toBeInTheDocument();
	} );

	it( 'renders PluginsList with the list of plugins when the list is not empty', () => {
		const plugins = [
			{
				fetched: true,
				icon: '',
				id: '',
				last_updated: null,
				name: '',
				sites: {},
				slug: '',
				isSelected: true,
				onClick: () => {
					/* Do nothing */
				},
			},
		];

		render( <PluginManagementV2 plugins={ plugins } filter="all" /> );
		expect( screen.queryByText( MOCK_PLUGINSLIST_TEXT ) ).toBeInTheDocument();

		const [ props ] = PluginsList.mock.calls[ 0 ];
		expect( props.items ).toBe( plugins );
	} );
} );
