/* global jasmine:false */
/* eslint-disable mocha/no-top-level-hooks */
/**
 * External dependencies
 */
import config from 'config';
import * as failFast from 'jasmine-fail-fast';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );

// Default timeout
jest.setTimeout( mochaTimeOut );

// Bail if a test in the suite fails
const jasmineEnv = jasmine.getEnv();
jasmineEnv.addReporter( failFast.init() );
