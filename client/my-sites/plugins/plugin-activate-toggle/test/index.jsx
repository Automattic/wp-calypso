/**
 * @jest-environment jsdom
 */
import { mount } from 'enzyme';
import { spy } from 'sinon';
import { PluginActivateToggle } from 'calypso/my-sites/plugins/plugin-activate-toggle';
import fixtures from './fixtures';

jest.mock( 'calypso/my-sites/plugins/plugin-action/plugin-action', () =>
	require( './mocks/plugin-action' )
);

describe( 'PluginActivateToggle', () => {
	const mockedProps = {
		recordGoogleEvent: spy(),
		recordTracksEvent: spy(),
		removePluginStatuses: spy(),
		togglePluginActivation: spy(),
		translate: spy(),
	};

	afterEach( () => {
		mockedProps.recordGoogleEvent.resetHistory();
	} );

	test( 'should render the component', () => {
		const wrapper = mount( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		expect( wrapper.find( '.plugin-action' ) ).toHaveLength( 1 );
	} );

	test( 'should register an event when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.recordGoogleEvent.called ).toEqual( true );
		expect( mockedProps.recordTracksEvent.called ).toEqual( true );
	} );

	test( 'should call an action when the subcomponent action is executed', () => {
		const wrapper = mount( <PluginActivateToggle { ...mockedProps } { ...fixtures } /> );

		wrapper.simulate( 'click' );

		expect( mockedProps.togglePluginActivation.called ).toEqual( true );
	} );
} );
