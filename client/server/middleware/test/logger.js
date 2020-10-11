/**
 * External dependencies
 */
import EventEmitter from 'events';

/**
 * Internal dependencies
 */
import loggerMiddleware from '../logger';
import config from 'config';

const mockLogger = {
	info: jest.fn(),
};
jest.mock( 'server/lib/logger', () => ( {
	getLogger: () => mockLogger,
} ) );
jest.mock( 'config', () => jest.fn() );

const fakeRequest = ( { method, url, ip, httpVersion, headers = {} } = {} ) => {
	const req = new EventEmitter();
	req.method = method;
	req.originalUrl = url;
	req.ip = ip;
	req.get = ( header ) => headers[ header.toLowerCase() ];
	req.httpVersion = httpVersion;
	return req;
};

const fakeResponse = ( { statusCode, headers = {} } = {} ) => {
	const res = new EventEmitter();
	res.headersSent = true;
	res.get = ( header ) => headers[ header.toLowerCase() ];
	res.statusCode = statusCode;
	return res;
};

const withCommitSha = ( sha ) => {
	const current = process.env.COMMIT_SHA;
	process.env.COMMIT_SHA = sha;

	afterAll( () => {
		process.env.COMMIT_SHA = current;
	} );
};

const withEnv = ( env ) => {
	config.mockImplementation( ( key ) => {
		if ( key === 'env_id' ) return env;
	} );

	afterAll( () => {
		config.reset();
	} );
};

const simulateRequest = ( { req, res, delay } ) => {
	loggerMiddleware()( req, res, () => {} );
	jest.advanceTimersByTime( delay );
	res.emit( 'finish' );
};

beforeEach( () => {
	jest.useFakeTimers( 'modern' );
} );

afterEach( () => {
	jest.useRealTimers();
	jest.resetAllMocks();
} );

it( 'Adds a `logger` property to the request', () => {
	const req = fakeRequest();

	simulateRequest( {
		req,
		res: fakeResponse(),
	} );

	expect( req.logger ).toBe( mockLogger );
} );

it( 'It logs info about the request', () => {
	withEnv( 'production' );

	simulateRequest( {
		req: fakeRequest( {
			method: 'GET',
			httpVersion: '2.0',
			headers: {
				'user-agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
				referer: 'https://wordpress.com',
			},
			url: '/example.html',
			ip: '127.0.0.1',
		} ),
		res: fakeResponse( {
			statusCode: '200',
			headers: {
				'content-length': 123,
			},
		} ),
		delay: 100,
	} );

	expect( mockLogger.info ).toHaveBeenCalledWith( {
		length: 123,
		duration: 100,
		status: '200',
		method: 'GET',
		env: 'production',
		url: '/example.html',
		httpVersion: '2.0',
		userAgent: 'Chrome 85',
		rawUserAgent:
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
		remoteAddr: '127.0.0.1',
		referrer: 'https://wordpress.com',
	} );
} );

it( "Logs raw UserAgent if it can't be parsed", () => {
	simulateRequest( {
		req: fakeRequest( {
			headers: {
				'user-agent': 'A random browser',
			},
		} ),
		res: fakeResponse(),
	} );

	expect( mockLogger.info ).toHaveBeenCalledWith(
		expect.objectContaining( {
			userAgent: 'A random browser',
		} )
	);
} );

it( 'Adds the COMMIT_SHA as version', () => {
	withCommitSha( 'abcd1234' );

	simulateRequest( {
		req: fakeRequest(),
		res: fakeResponse(),
	} );

	expect( mockLogger.info ).toHaveBeenCalledWith(
		expect.objectContaining( {
			appVersion: 'abcd1234',
		} )
	);
} );
