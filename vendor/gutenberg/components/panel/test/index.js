/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Panel from '../';

describe( 'Panel', () => {
	describe( 'basic rendering', () => {
		it( 'should render an empty div without any provided props', () => {
			const panel = shallow( <Panel /> );
			expect( panel.hasClass( 'components-panel' ) ).toBe( true );
			expect( panel.type() ).toBe( 'div' );
			expect( panel.find( 'div' ).shallow().children() ).toHaveLength( 0 );
		} );

		it( 'should render a PanelHeader component when provided text in the header prop', () => {
			const panel = shallow( <Panel header="Header Label" /> );
			const panelHeader = panel.find( 'PanelHeader' );
			expect( panelHeader.prop( 'label' ) ).toBe( 'Header Label' );
			expect( panel.find( 'div' ).shallow().children() ).toHaveLength( 1 );
		} );

		it( 'should render an additional className', () => {
			const panel = shallow( <Panel className="the-panel" /> );
			expect( panel.hasClass( 'the-panel' ) ).toBe( true );
		} );

		it( 'should add additional child elements to be rendered in the panel', () => {
			const panel = shallow( <Panel children="The Panel" /> );
			expect( panel.text() ).toBe( 'The Panel' );
			expect( panel.find( 'div' ).shallow().children() ).toHaveLength( 1 );
		} );

		it( 'should render both children and header when provided as props', () => {
			const panel = shallow( <Panel children="The Panel" header="The Header" /> );
			expect( panel.find( 'div' ).shallow().children() ).toHaveLength( 2 );
		} );
	} );
} );
