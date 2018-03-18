/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET } from 'state/action-types';

describe( 'reducer', () => {
	test( 'should update the domain search prefill', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET,
					prefill: 'domain prefill',
					overwrite: false,
				}
			)
		).to.be.eql( {
			prefill: 'domain prefill',
		} );
	} );
	test( 'should update the domain search prefill if existing value is not a string', () => {
		expect(
			reducer(
				{
					prefill: 5,
				},
				{
					type: SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET,
					prefill: 'domain prefill',
					overwrite: false,
				}
			)
		).to.be.eql( {
			prefill: 'domain prefill',
		} );
	} );
	test( 'should update the domain search prefill if existing value is an empty string', () => {
		expect(
			reducer(
				{
					prefill: '',
				},
				{
					type: SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET,
					prefill: 'domain prefill',
					overwrite: false,
				}
			)
		).to.be.eql( {
			prefill: 'domain prefill',
		} );
	} );
	test( 'should not update the domain search prefill if a lengthy string value is already defined', () => {
		expect(
			reducer(
				{
					prefill: 'existing value',
				},
				{
					type: SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET,
					prefill: 'new value',
					overwrite: false,
				}
			)
		).to.be.eql( {
			prefill: 'existing value',
		} );
	} );
	test( 'should update the domain search prefill if a lengthy string value is already defined if overwrite parameter is defined', () => {
		expect(
			reducer(
				{
					prefill: 'existing value',
				},
				{
					type: SIGNUP_STEPS_DOMAIN_SEARCH_PREFILL_SET,
					prefill: 'new value',
					overwrite: true,
				}
			)
		).to.be.eql( {
			prefill: 'new value',
		} );
	} );
} );
