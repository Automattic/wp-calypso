/* eslint-disable mocha/no-top-level-hooks */
/**
 * Internal dependencies
 */
import { startVideo, stopVideo, takeScreenshot } from './video-recorder';

beforeAll( startVideo );
afterAll( stopVideo );
afterEach( takeScreenshot );
