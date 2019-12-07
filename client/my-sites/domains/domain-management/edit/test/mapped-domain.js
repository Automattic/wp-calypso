/** @format */
/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { identity } from 'lodash';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { MappedDomain } from '../mapped-domain.jsx';

jest.mock( 'lib/analytics', () => {} );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'mapped-domain', () => {
	let props;

	beforeAll( () => {
		props = {
			selectedSite: {
				slug: 'neverexpires.wordpress.com',
				domain: 'neverexpires.com',
			},
			domain: {
				name: 'neverexpires.com',
				expirationMoment: null,
			},
			translate: identity,
		};
	} );

	test( 'should render when props.domain.expirationMoment is null', () => {
		const renderer = new ShallowRenderer();
		renderer.render( <MappedDomain { ...props } /> );
		const out = renderer.getRenderOutput();

		assert( out );
	} );

	test( 'should use selectedSite.slug for URLs', () => {
		const domainPaths = require( 'my-sites/domains/paths' );
		const dnsStub = sinon.stub( domainPaths, 'domainManagementDns' );
		const emailPaths = require( 'my-sites/email/paths' );
		const emailStub = sinon.stub( emailPaths, 'emailManagement' );

		const renderer = new ShallowRenderer();
		renderer.render( <MappedDomain { ...props } /> );
		renderer.getRenderOutput();

		assert( dnsStub.calledWith( 'neverexpires.wordpress.com', 'neverexpires.com' ) );
		assert( emailStub.calledWith( 'neverexpires.wordpress.com', 'neverexpires.com' ) );

		dnsStub.restore();
		emailStub.restore();
	} );
} );
