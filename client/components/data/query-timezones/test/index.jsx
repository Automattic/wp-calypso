/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { requestTimezones as requestingTimezonesAction } from 'state/timezones/actions';
import {
	QueryTimezones as QueryTimezones,
	mapDispatchToProps,
} from '../';

describe( 'mounting component', () => {
	it( 'should mount as null', () => {
		const wrapped = shallow( <QueryTimezones { ...{ requestTimezones: noop } } /> );

		expect( wrapped.equals( null ) ).to.be.true;
	} );
} );

describe( 'request', () => {
	it( 'should issue timezones request when called', () => {
		const dispatch = spy();
		const { requestTimezones } = mapDispatchToProps;

		dispatch( requestTimezones() );
		expect( dispatch ).to.have.been.calledWith( requestingTimezonesAction() );
	} );
} );
