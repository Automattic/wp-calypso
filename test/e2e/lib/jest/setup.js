import config from 'config';

// Default timeout
jest.setTimeout( config.get( 'jestTimeoutMS' ) );
