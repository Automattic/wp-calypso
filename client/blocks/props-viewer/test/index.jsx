/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import PropsViewer from '../index';

const components = require( '../../../../server/devdocs/proptypes-index.json' );

const findRealComponent = ( slug ) => {
	// remove the last character. As of right now, all plural display names are with just an 's'
	const singular = slug.slice( 0, -1 );
	return components.filter( ( component ) => {
		return ( slug === component.slug || singular === component.slug ) && component.includePath.indexOf( 'example' ) < 0;
	} );
};

describe( 'PropsViewer', () => {
	context( 'no matching component', () => {
		it( 'should render only the example', () => {
			const component = ( <PropsViewer component={ 'no-match-here-go-away' } example={ <div /> } /> );
			const wrapper = shallow( component );
			expect( wrapper.childAt( 0 ).matchesElement( <div></div> ) ).to.be.true;
		} );
	} );

	context( 'renders a table of propTypes', () => {
		it( 'can render itself', () => {
			const example = ( <div>Example goes here</div> );
			const component = ( <PropsViewer component={ 'props-viewer' } example={ example } /> );
			const spection = findRealComponent( 'props-viewer' )[ 0 ];

			const wrapper = shallow( component );
			expect( wrapper.childAt( 0 ).matchesElement( <div>Example goes here</div> ) ).to.be.true;

			const tableWrapper = wrapper.childAt( 1 );
			expect( tableWrapper.childAt( 0 ).text() ).equals( spection.description );

			const tbody = wrapper.find( 'tbody' );
			const componentRow = tbody.childAt( 0 );

			expect( componentRow.childAt( 1 ).text() ).equals( 'component' );
			expect( componentRow.childAt( 2 ).text() ).equals( spection.props.component.type.name );
			expect( componentRow.childAt( 3 ).text() ).equals( 'undefined' );
			expect( componentRow.childAt( 4 ).text() ).equals( spection.props.component.description );
		} );
	} );
} );
