/* global jasmine:false */
/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';
import * as failFast from 'jasmine-fail-fast';

// Default timeout
jest.setTimeout( config.get( 'jestTimeoutMS' ) );

// Bail if a test in the suite fails
// eslint-disable-next-line jest/no-jasmine-globals
const jasmineEnv = jasmine.getEnv();
jasmineEnv.addReporter( failFast.init() );
