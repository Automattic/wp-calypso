/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PageAttributesOrder } from '../order';

describe( 'PageAttributesOrder', () => {
	it( 'should reject invalid input', () => {
		const onUpdateOrder = jest.fn();
		const wrapper = shallow(
			<PageAttributesOrder onUpdateOrder={ onUpdateOrder } />
		);

		wrapper.find( 'input' ).simulate( 'change', {
			target: {
				value: -1,
			},
		} );

		wrapper.find( 'input' ).simulate( 'change', {
			target: {
				value: 'bad',
			},
		} );

		expect( onUpdateOrder ).not.toHaveBeenCalled();
	} );

	it( 'should update with valid input', () => {
		const onUpdateOrder = jest.fn();
		const wrapper = shallow(
			<PageAttributesOrder onUpdateOrder={ onUpdateOrder } />
		);

		wrapper.find( 'input' ).simulate( 'change', {
			target: {
				value: 4,
			},
		} );

		expect( onUpdateOrder ).toHaveBeenCalledWith( 4 );
	} );
} );
