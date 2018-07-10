/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import withState from '../';

describe( 'withState', () => {
	it( 'should pass initial state and allow updates', () => {
		const EnhancedComponent = withState( { count: 0 } )( ( { count, setState } ) => (
			<button onClick={ () => setState( ( state ) => ( { count: state.count + 1 } ) ) }>
				{ count }
			</button>
		) );

		const wrapper = mount( <EnhancedComponent /> );

		expect( wrapper.html() ).toBe( '<button>0</button>' );
		wrapper.find( 'button' ).simulate( 'click' );
		expect( wrapper.html() ).toBe( '<button>1</button>' );
	} );
} );
