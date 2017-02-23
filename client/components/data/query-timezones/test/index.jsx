/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { QueryTimezones } from '../';

describe( 'mounting component', () => {
	it( 'should mount as null', () => {
		const wrapped = shallow( <QueryTimezones { ...{ requestTimezones: noop } } /> );

		expect( wrapped.equals( null ) ).to.be.true;
	} );
} );
