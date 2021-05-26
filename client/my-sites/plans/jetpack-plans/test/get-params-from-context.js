/**
 * Internal dependencies
 */
import getParamsFromContext from '../get-params-from-context';

const annualDuration = 'annual';
const monthlyDuration = 'monthly';
const site = 'example.com';

describe( 'getParamsFromContext', () => {
	it( 'should return undefined values if no parameter is set', () => {
		const context = {
			params: {},
		};

		expect( getParamsFromContext( context ) ).toEqual( {
			duration: undefined,
			site: undefined,
		} );
	} );

	it( 'should return the duration if the parameter is valid', () => {
		const context = {
			params: {
				duration: annualDuration,
			},
		};

		expect( getParamsFromContext( context ) ).toHaveProperty( 'duration', annualDuration );

		context.params.duration = monthlyDuration;

		expect( getParamsFromContext( context ) ).toHaveProperty( 'duration', monthlyDuration );
	} );

	it( 'should return an undefined duration if the parameter is invalid', () => {
		const context = {
			params: {
				duration: 'abc',
			},
		};

		expect( getParamsFromContext( context ) ).toHaveProperty( 'duration', undefined );
	} );

	it( 'should return an undefined site if the parameter is not set', () => {
		const context = {
			params: {
				duration: annualDuration,
			},
		};

		expect( getParamsFromContext( context ) ).toHaveProperty( 'site', undefined );
	} );

	it( 'should return the site if the parameter is set', () => {
		const context = {
			params: {
				duration: annualDuration,
				site,
			},
		};

		expect( getParamsFromContext( context ) ).toHaveProperty( 'site', site );

		context.params.duration = 'abc';

		expect( getParamsFromContext( context ) ).toHaveProperty( 'site', site );
	} );

	it( 'should return the site if the parameter is not set but the duration parameter is invalid', () => {
		const context = {
			params: {
				duration: site,
			},
		};

		expect( getParamsFromContext( context ) ).toHaveProperty( 'site', site );
	} );
} );
