/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import PanelBody from '../body';

describe( 'PanelBody', () => {
	describe( 'basic rendering', () => {
		it( 'should render an empty div with the matching className', () => {
			const panelBody = shallow( <PanelBody /> );
			expect( panelBody.hasClass( 'components-panel__body' ) ).toBe( true );
			expect( panelBody.type() ).toBe( 'div' );
		} );

		it( 'should render an Button matching the following props and state', () => {
			const panelBody = shallow( <PanelBody title="Some Text" /> );
			const button = panelBody.find( 'Button' );
			const icon = panelBody.find( 'Dashicon' );
			expect( button.shallow().hasClass( 'components-panel__body-toggle' ) ).toBe( true );
			expect( panelBody.state( 'opened' ) ).toBe( true );
			expect( button.prop( 'onClick' ) ).toBe( panelBody.instance().toggle );
			expect( icon.prop( 'icon' ) ).toBe( 'arrow-up' );
			expect( button.childAt( 0 ).name() ).toBe( 'Dashicon' );
			expect( button.childAt( 1 ).text() ).toBe( 'Some Text' );
		} );

		it( 'should change state and props when sidebar is closed', () => {
			const panelBody = shallow( <PanelBody title="Some Text" initialOpen={ false } /> );
			expect( panelBody.state( 'opened' ) ).toBe( false );
			const icon = panelBody.find( 'Dashicon' );
			expect( icon.prop( 'icon' ) ).toBe( 'arrow-down' );
		} );

		it( 'should use the "opened" prop instead of state if provided', () => {
			const panelBody = shallow( <PanelBody title="Some Text" opened={ true } initialOpen={ false } /> );
			expect( panelBody.state( 'opened' ) ).toBe( false );
			const icon = panelBody.find( 'Dashicon' );
			expect( icon.prop( 'icon' ) ).toBe( 'arrow-up' );
		} );

		it( 'should render child elements within PanelBody element', () => {
			const panelBody = shallow( <PanelBody children="Some Text" /> );
			expect( panelBody.instance().props.children ).toBe( 'Some Text' );
			expect( panelBody.text() ).toBe( 'Some Text' );
		} );

		it( 'should pass children prop but not render when sidebar is closed', () => {
			const panelBody = shallow( <PanelBody children="Some Text" initialOpen={ false } /> );
			expect( panelBody.instance().props.children ).toBe( 'Some Text' );
			// Text should be empty even though props.children is set.
			expect( panelBody.text() ).toBe( '' );
		} );
	} );

	describe( 'mounting behavior', () => {
		it( 'should mount with a default of being opened', () => {
			const panelBody = mount( <PanelBody /> );
			expect( panelBody.state( 'opened' ) ).toBe( true );
		} );

		it( 'should mount with a state of not opened when initialOpen set to false', () => {
			const panelBody = mount( <PanelBody initialOpen={ false } /> );
			expect( panelBody.state( 'opened' ) ).toBe( false );
		} );
	} );

	describe( 'toggling behavior', () => {
		const fakeEvent = { preventDefault: () => undefined };

		it( 'should set the opened state to false when a toggle fires', () => {
			const panelBody = mount( <PanelBody /> );
			panelBody.instance().toggle( fakeEvent );
			expect( panelBody.state( 'opened' ) ).toBe( false );
		} );

		it( 'should set the opened state to true when a toggle fires on a closed state', () => {
			const panelBody = mount( <PanelBody initialOpen={ false } /> );
			panelBody.instance().toggle( fakeEvent );
			expect( panelBody.state( 'opened' ) ).toBe( true );
		} );
	} );
} );
