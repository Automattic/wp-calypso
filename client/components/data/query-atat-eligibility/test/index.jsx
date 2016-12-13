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
import { requestEligibility } from 'state/automated-transfer/actions';
import {
	QueryAutomatedTransferEligibility as QueryEligibility,
	mapDispatchToProps,
} from '../';

describe( 'QueryAutomatedTransferEligibility', () => {
	const siteId = 1337;

	it( 'should mount as null', () => {
		const wrapped = shallow( <QueryEligibility { ...{ request: noop, siteId } } /> );

		expect( wrapped.equals( null ) ).to.be.true;
	} );

	it( 'should issue request on mount if given a siteId', () => {
		const request = spy();
		shallow( <QueryEligibility { ...{ request, siteId } } /> );

		expect( request ).to.have.been.calledWith( siteId );
	} );

	it( 'should issue no request on mount if not given a siteId', () => {
		const request = spy();
		shallow( <QueryEligibility { ...{ request, siteId: null } } /> );
		shallow( <QueryEligibility { ...{ request, siteId: undefined } } /> );
		shallow( <QueryEligibility { ...{ request } } /> );

		expect( request ).to.have.not.been.called;
	} );

	it( 'should issue new request on change of siteId', () => {
		const request = spy();
		const wrapped = shallow( <QueryEligibility { ...{ request, siteId } } /> );

		expect( request ).to.have.been.calledOnce;
		expect( request ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId: siteId + 1 } );

		expect( request ).to.have.been.calledTwice;
		expect( request ).to.have.been.calledWith( siteId + 1 );
	} );

	it( 'should not issue a new request when the siteId stays the same', () => {
		const request = spy();
		const wrapped = shallow( <QueryEligibility { ...{ request, siteId } } /> );

		expect( request ).to.have.been.calledOnce;
		expect( request ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId } );

		expect( request ).to.have.been.calledOnce;
	} );

	it( 'should not issue a new request when the siteId becomes empty', () => {
		const request = spy();
		const wrapped = shallow( <QueryEligibility { ...{ request, siteId } } /> );

		expect( request ).to.have.been.calledOnce;
		expect( request ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId: null } );
		expect( request ).to.have.been.calledOnce;

		wrapped.setProps( { siteId } );
		expect( request ).to.have.been.calledTwice;

		wrapped.setProps( { siteId: undefined } );
		expect( request ).to.have.been.calledTwice;
	} );

	describe( 'mapDispatchToProps', () => {
		describe( '#request', () => {
			it( 'should issue eligibility request when called', () => {
				const dispatch = spy();

				const { request } = mapDispatchToProps( dispatch );

				request( siteId );
				expect( dispatch ).to.have.been.calledWith( requestEligibility( siteId ) );
			} );
		} );
	} );
} );
