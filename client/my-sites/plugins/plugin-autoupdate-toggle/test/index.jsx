/**
 * @jest-environment jsdom
 */
import { mount } from 'enzyme';
import { PluginAutoUpdateToggle } from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import fixtures from './fixtures';

jest.mock( 'calypso/my-sites/plugins/plugin-action/plugin-action', () =>
	require( './mocks/plugin-action' )
);
jest.mock( 'query', () => require( 'component-query' ), { virtual: true } );

describe( 'PluginAutoupdateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: jest.fn(),
		recordTracksEvent: jest.fn(),
		removePluginStatuses: jest.fn(),
		translate: jest.fn(),
		togglePluginAutoUpdate: jest.fn(),
	};

	test( 'should render the component', () => {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).toHaveLength( 1 );
	} );

	test( 'should register an event when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.recordGoogleEvent ).toHaveBeenCalled();
		expect( mockedProps.recordTracksEvent ).toHaveBeenCalled();
	} );

	test( 'should call an action when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginAutoUpdateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.togglePluginAutoUpdate ).toHaveBeenCalled();
	} );
} );
