/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { QueryAutomatedTransferEligibility as QueryEligibility, mapDispatchToProps } from '../';
import { requestEligibility as requestEligibilityAction } from 'calypso/state/automated-transfer/actions';

describe( 'QueryAutomatedTransferEligibility', () => {
	const siteId = 1337;

	test( 'should mount as null', () => {
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility: noop, siteId } } /> );

		expect( wrapped.equals( null ) ).to.be.true;
	} );

	test( 'should issue request on mount if given a siteId', () => {
		const requestEligibility = spy();
		shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledWith( siteId );
	} );

	test( 'should issue no request on mount if not given a siteId', () => {
		const requestEligibility = spy();
		shallow( <QueryEligibility { ...{ requestEligibility, siteId: null } } /> );
		shallow( <QueryEligibility { ...{ requestEligibility, siteId: undefined } } /> );
		shallow( <QueryEligibility { ...{ requestEligibility } } /> );

		expect( requestEligibility ).to.have.not.been.called;
	} );

	test( 'should issue new request on change of siteId', () => {
		const requestEligibility = spy();
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledOnce;
		expect( requestEligibility ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId: siteId + 1 } );

		expect( requestEligibility ).to.have.been.calledTwice;
		expect( requestEligibility ).to.have.been.calledWith( siteId + 1 );
	} );

	test( 'should not issue a new request when the siteId stays the same', () => {
		const requestEligibility = spy();
		const wrapped = shallow( <QueryEligibility { ...{ requestEligibility, siteId } } /> );

		expect( requestEligibility ).to.have.been.calledOnce;
		expect( requestEligibility ).to.have.been.calledWith( siteId );

		wrapped.setProps( { siteId } );

		expect( requestEligibility ).to.have.been.calledOnce;
	} );

	test( 'should not issue a new request when the siteId becomes empty', () => {
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
			test( 'should issue eligibility request when called', () => {
				const dispatch = spy();

				const { requestEligibility } = mapDispatchToProps;

				dispatch( requestEligibility( siteId ) );
				expect( dispatch ).to.have.been.calledWith( requestEligibilityAction( siteId ) );
			} );
		} );
	} );
} );
