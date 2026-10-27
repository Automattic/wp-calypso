const { TestEnvironment } = require( 'jest-environment-jsdom' );

/**
 * A jsdom environment where `process.env.TZ = '...'` inside a test changes the
 * time zone that Date and Intl use.
 *
 * Jest gives each test file its own copy of `process.env`, so assigning TZ
 * there normally has no effect. Opt in per file with:
 *     @jest-environment <rootDir>/../test/client/jest-environment-timezone.js
 */
class TimezoneEnvironment extends TestEnvironment {
	constructor( config, context ) {
		super( config, context );
		this.originalTZ = process.env.TZ;

		this.global.process.env = new Proxy( this.global.process.env, {
			set( target, key, value ) {
				if ( key === 'TZ' ) {
					setRealTimezone( value );
				}
				target[ key ] = value;
				return true;
			},
			deleteProperty( target, key ) {
				if ( key === 'TZ' ) {
					setRealTimezone( undefined );
				}
				delete target[ key ];
				return true;
			},
		} );
	}

	async teardown() {
		setRealTimezone( this.originalTZ );
		await super.teardown();
	}
}

function setRealTimezone( timezone ) {
	if ( timezone === undefined ) {
		delete process.env.TZ;
	} else {
		process.env.TZ = timezone;
	}
}

module.exports = TimezoneEnvironment;
