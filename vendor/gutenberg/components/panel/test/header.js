/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import PanelHeader from '../header.js';

describe( 'PanelHeader', () => {
	describe( 'basic rendering', () => {
		it( 'should render PanelHeader with empty div inside', () => {
			const panelHeader = shallow( <PanelHeader /> );
			expect( panelHeader.hasClass( 'components-panel__header' ) ).toBe( true );
			expect( panelHeader.type() ).toBe( 'div' );
			expect( panelHeader.find( 'div' ).shallow().children() ).toHaveLength( 0 );
		} );

		it( 'should render a label matching the text provided in the prop', () => {
			const panelHeader = shallow( <PanelHeader label="Some Text" /> );
			const label = panelHeader.find( 'h2' ).shallow();
			expect( label.text() ).toBe( 'Some Text' );
			expect( label.type() ).toBe( 'h2' );
		} );

		it( 'should render child elements in the panel header body when provided', () => {
			const panelHeader = shallow( <PanelHeader children="Some Text" /> );
			expect( panelHeader.text() ).toBe( 'Some Text' );
			expect( panelHeader.find( 'div' ).shallow().children() ).toHaveLength( 1 );
		} );

		it( 'should render both child elements and label when passed in', () => {
			const panelHeader = shallow( <PanelHeader label="Some Label" children="Some Text" /> );
			expect( panelHeader.find( 'div' ).shallow().children() ).toHaveLength( 2 );
		} );
	} );
} );
