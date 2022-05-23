/**
 * @jest-environment jsdom
 */
import { mount } from 'enzyme';
import { PluginActivateToggle } from 'calypso/my-sites/plugins/plugin-activate-toggle';
import fixtures from './fixtures';

jest.mock( 'calypso/my-sites/plugins/plugin-action/plugin-action', () =>
	require( './mocks/plugin-action' )
);

describe( 'PluginActivateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: jest.fn(),
		recordTracksEvent: jest.fn(),
		removePluginStatuses: jest.fn(),
		togglePluginActivation: jest.fn(),
		translate: jest.fn(),
	};

	test( 'should render the component', () => {
		const wrapper = mount( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).toHaveLength( 1 );
	} );

	test( 'should register an event when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.recordGoogleEvent ).toHaveBeenCalled();
		expect( mockedProps.recordTracksEvent ).toHaveBeenCalled();
	} );

	test( 'should call an action when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.togglePluginActivation ).toHaveBeenCalled();
	} );
} );
