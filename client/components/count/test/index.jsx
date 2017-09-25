/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { Count } from '../';

describe( 'Count', function() {
	it( 'should use the correct class name', function() {
		const count = shallow( <Count count={ 23 } numberFormat={ identity } /> );
		expect( count ).to.have.className( 'count' );
	} );

	it( 'should call provided as prop numberFormat function', function() {
		const numberFormatSpy = spy();
		shallow( <Count count={ 23 } numberFormat={ numberFormatSpy } /> );
		expect( numberFormatSpy ).to.have.been.calledWith( 23 );
	} );
} );
