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

describe( 'Count', () => {
	test( 'should use the correct class name', () => {
		const count = shallow( <Count count={ 23 } numberFormat={ identity } /> );
		expect( count ).to.have.className( 'count' );
	} );

	test( 'should call provided as prop numberFormat function', () => {
		const numberFormatSpy = spy();
		shallow( <Count count={ 23 } numberFormat={ numberFormatSpy } /> );
		expect( numberFormatSpy ).to.have.been.calledWith( 23 );
	} );
} );
