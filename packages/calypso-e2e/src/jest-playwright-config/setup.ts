import { jest } from '@jest/globals';
import config from 'config';

// Set the default timeout value
jest.setTimeout( config.get( 'jestTimeoutMS' ) );
