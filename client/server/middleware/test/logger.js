import EventEmitter from 'events';
import config from '@automattic/calypso-config';
import loggerMiddleware from '../logger';

const requestLogger = {
	info: jest.fn(),
};
const mockRootLogger = {
	child: jest.fn( () => requestLogger ),
};
jest.mock( 'calypso/server/lib/logger', () => ( {
	getLogger: () => mockRootLogger,
} ) );
jest.mock( '@automattic/calypso-config', () => jest.fn() );
jest.mock( 'crypto', () => ( {
	randomUUID: () => '00000000-0000-0000-0000-000000000000',
} ) );

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
		if ( key === 'env_id' ) {
			return env;
		}
	} );

	afterAll( () => {
		config.mockReset();
	} );
};

const simulateRequest = ( { req, res, delay, finished = true } ) => {
	loggerMiddleware()( req, res, () => {} );
	jest.advanceTimersByTime( delay );
	res.finished = finished;
	res.emit( 'close' );
};

describe( 'Logger middleware', () => {
	withEnv( 'production' );
	withCommitSha( 'abcd1234' );

	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
		jest.clearAllMocks();
	} );

	it( 'Adds a `logger` property to the request with the request id', () => {
		const req = fakeRequest( {
			headers: {
				'user-agent': 'A random browser',
			},
			url: '/example.html',
		} );

		simulateRequest( {
			req,
			res: fakeResponse(),
		} );

		expect( req.logger ).toBe( requestLogger );
		expect( mockRootLogger.child ).toHaveBeenCalledWith( {
			reqId: '00000000-0000-0000-0000-000000000000',
			appVersion: 'abcd1234',
			env: 'production',
			path: undefined,
			url: '/example.html',
			userAgent: 'A random browser',
		} );
	} );

	it( 'Logs info about the request', () => {
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

		expect( requestLogger.info ).toHaveBeenCalledWith(
			expect.objectContaining( {
				length: 123,
				duration: 100,
				status: '200',
				method: 'GET',
				httpVersion: '2.0',
				rawUserAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
				remoteAddr: '127.0.0.1',
				referrer: 'https://wordpress.com',
			} ),
			'request finished'
		);
	} );

	it( 'Logs closed requests', () => {
		simulateRequest( {
			req: fakeRequest(),
			res: fakeResponse(),
			finished: false,
		} );

		expect( requestLogger.info ).toHaveBeenCalledWith( expect.anything(), 'request closed' );
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

		expect( requestLogger.info ).toHaveBeenCalledWith(
			expect.objectContaining( {
				rawUserAgent: 'A random browser',
			} ),
			expect.anything()
		);
	} );

	it( 'Adds the COMMIT_SHA as version', () => {
		simulateRequest( {
			req: fakeRequest(),
			res: fakeResponse(),
		} );

		expect( mockRootLogger.child ).toHaveBeenCalledWith(
			expect.objectContaining( {
				appVersion: 'abcd1234',
			} )
		);
	} );

	it( 'Does not log static requests in dev mode', () => {
		const oldNodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';
		simulateRequest( {
			req: fakeRequest( {
				url: '/calypso/abc',
			} ),
			res: fakeResponse(),
		} );
		process.env.NODE_ENV = oldNodeEnv;
		expect( requestLogger.info ).not.toHaveBeenCalled();
	} );

	it( 'Does not log non-static requests in dev mode', () => {
		const oldNodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';
		simulateRequest( {
			req: fakeRequest( {
				url: '/home',
			} ),
			res: fakeResponse(),
		} );
		process.env.NODE_ENV = oldNodeEnv;
		expect( requestLogger.info ).toHaveBeenCalled();
	} );

	it( 'Does log static requests in non-dev mode', () => {
		const oldNodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'foo';
		simulateRequest( {
			req: fakeRequest( {
				url: '/calypso/abc',
			} ),
			res: fakeResponse(),
		} );
		process.env.NODE_ENV = oldNodeEnv;
		expect( requestLogger.info ).toHaveBeenCalled();
	} );
} );
