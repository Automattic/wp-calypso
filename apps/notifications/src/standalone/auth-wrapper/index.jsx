/**
 * Internal dependencies
 */
import OauthWrapper from './oauth';
import IframeProxyWrapper from './iframe-proxy';

const AuthWrapper = ( Wrapped ) => {
	const isProduction = 'production' === process.env.NODE_ENV;
	const Wrapper = isProduction ? IframeProxyWrapper : OauthWrapper;

	return Wrapper( Wrapped );
};

export default AuthWrapper;
