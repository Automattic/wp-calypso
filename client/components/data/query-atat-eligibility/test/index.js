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
import { requestEligibility as requestEligibilityAction } from 'state/automated-transfer/actions';
import {
	QueryAutomatedTransferEligibility as QueryEligibility,
	mapDispatchToProps,
} from '../';

describe( 'QueryAutomatedTransferEligibility', () => {
	const siteId = 1337;

	it( 'should mount as null', () => {
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility: noop, siteId } } /> );

		expect( wrapped.equals( null ) ).to.be.true;
	} );

	it( 'should issue request on mount if given a siteId', () => {
		const requestEligibility = spy();
		shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledWith( siteId );
	} );

	it( 'should issue no request on mount if not given a siteId', () => {
		const requestEligibility = spy();
		shallow( <QueryEligibility { ...{ requestEligibility, siteId: null } } /> );
		shallow( <QueryEligibility { ...{ requestEligibility, siteId: undefined } } /> );
		shallow( <QueryEligibility { ...{ requestEligibility } } /> );

		expect( requestEligibility ).to.have.not.been.called;
	} );

	it( 'should issue new request on change of siteId', () => {
		const requestEligibility = spy();
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledOnce;
		expect( requestEligibility ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId: siteId + 1 } );

		expect( requestEligibility ).to.have.been.calledTwice;
		expect( requestEligibility ).to.have.been.calledWith( siteId + 1 );
	} );

	it( 'should not issue a new request when the siteId stays the same', () => {
		const requestEligibility = spy();
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledOnce;
		expect( requestEligibility ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId } );

		expect( requestEligibility ).to.have.been.calledOnce;
	} );

	it( 'should not issue a new request when the siteId becomes empty', () => {
		const requestEligibility = spy();
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledOnce;
		expect( requestEligibility ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId: null } );
		expect( requestEligibility ).to.have.been.calledOnce;

		wrapped.setProps( { siteId } );
		expect( requestEligibility ).to.have.been.calledTwice;

		wrapped.setProps( { siteId: undefined } );
		expect( requestEligibility ).to.have.been.calledTwice;
	} );

	describe( 'mapDispatchToProps', () => {
		describe( '#request', () => {
			it( 'should issue eligibility request when called', () => {
				const dispatch = spy();

				const { requestEligibility } = mapDispatchToProps;

				dispatch( requestEligibility( siteId ) );
				expect( dispatch ).to.have.been.calledWith( requestEligibilityAction( siteId ) );
			} );
		} );
	} );
} );
