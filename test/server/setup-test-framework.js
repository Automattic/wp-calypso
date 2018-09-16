/** @format */
/**
 * External dependencies
 */
import 'cache-require-paths';
import { disableNetConnect } from 'nock';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use( sinonChai );
disableNetConnect();
