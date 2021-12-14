import path from 'path';

export default async (): Promise< void > => {
	if ( process.env.SAVE_AUTH_COOKIES === 'true' ) {
		process.env.COOKIES_PATH = path.join( __dirname, '../../', 'cookies' );
	}
};
