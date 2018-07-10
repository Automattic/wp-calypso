/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import '../store';
import withViewportMatch from '../with-viewport-match';

describe( 'withViewportMatch()', () => {
	const Component = () => <div>Hello</div>;

	it( 'should render with result of query as custom prop name', () => {
		dispatch( 'core/viewport' ).setIsMatching( { '> wide': true } );
		const EnhancedComponent = withViewportMatch( { isWide: '> wide' } )( Component );
		const wrapper = mount( <EnhancedComponent /> );

		expect( wrapper.find( Component ).props() ).toEqual( { isWide: true } );

		wrapper.unmount();
	} );
} );
