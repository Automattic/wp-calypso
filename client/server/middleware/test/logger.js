/**
 * External dependencies
 */
import EventEmitter from 'events';

/**
 * Internal dependencies
 */
import loggerMiddleware from '../logger';

const mockLogger = {
	info: jest.fn(),
};
jest.mock( 'server/lib/logger', () => ( {
	getLogger: () => mockLogger,
} ) );

const withRequest = ( { method, url, ip, httpVersionMajor, httpVersionMinor, headers } ) => {
	const req = new EventEmitter();
	req.method = method;
	req.originalUrl = url;
	req.ip = ip;
	req.get = ( header ) => headers[ header.toLowerCase() ];

	req.httpVersionMajor = httpVersionMajor;
	req.httpVersionMinor = httpVersionMinor;
	return req;
};

const withResponse = ( { statusCode, headers } ) => {
	const res = new EventEmitter();
	res.headersSent = true;
	res.get = ( header ) => headers[ header.toLowerCase() ];
	res.statusCode = statusCode;
	return res;
};

const withNodeEnv = ( env ) => {
	const current = process.env.NODE_ENV;
	process.env.NODE_ENV = env;

	afterAll( () => {
		process.env.NODE_ENV = current;
	} );
};

beforeEach( () => {
	jest.useFakeTimers( 'modern' );
} );

afterEach( () => {
	jest.useRealTimers();
	jest.resetAllMocks();
} );

it( 'Adds a `logger` property to the request', () => {
	const req = withRequest( {} );
	const res = withResponse( {} );
	const next = () => {};

	loggerMiddleware()( req, res, next );

	expect( req.logger ).toBe( mockLogger );
} );

it( 'When the response ends, it logs info about the request in dev mode', () => {
	withNodeEnv( 'development' );
	const req = withRequest( {
		method: 'GET',
		url: '/example.html',
	} );
	const res = withResponse( {
		statusCode: '200',
		headers: {
			'content-length': 123,
		},
	} );

	loggerMiddleware()( req, res, () => {} );
	jest.advanceTimersByTime( 100 );
	res.emit( 'finish' );

	expect( mockLogger.info ).toHaveBeenCalledWith( {
		length: 123,
		duration: 100,
		status: '200',
		method: 'GET',
		url: '/example.html',
	} );
} );

it( 'When the response ends, it logs info about the request in production mode', () => {
	withNodeEnv( 'production' );
	const req = withRequest( {
		method: 'GET',
		url: '/example.html',
		ip: '127.0.0.1',
		user: 'foo',
		httpVersionMajor: 2,
		httpVersionMinor: 0,
		headers: {
			referer: 'http://wordpress.com',
			'user-agent': 'Chrome',
		},
	} );
	const res = withResponse( {
		statusCode: '200',
		headers: {
			'content-length': 123,
		},
	} );

	loggerMiddleware()( req, res, () => {} );
	jest.advanceTimersByTime( 100 );
	res.emit( 'finish' );

	expect( mockLogger.info ).toHaveBeenCalledWith( {
		length: 123,
		duration: 100,
		status: '200',
		method: 'GET',
		url: '/example.html',
		remoteAddr: '127.0.0.1',
		httpVersion: '2.0',
		referrer: 'http://wordpress.com',
		userAgent: 'Chrome',
	} );
} );
