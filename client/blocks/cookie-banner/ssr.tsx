import CookieBannerContainer, { CookieBannerInner } from './container';
import { isServer } from './is-server';

const noop = () => undefined;

export const CookieBannerContainerSSR = ( { serverShow }: { serverShow: boolean } ) => {
	if ( ! isServer ) {
		// If we already have access to browser API, we can use the regular component
		return <CookieBannerContainer />;
	}

	return serverShow ? <CookieBannerInner onClose={ noop } /> : null;
};
