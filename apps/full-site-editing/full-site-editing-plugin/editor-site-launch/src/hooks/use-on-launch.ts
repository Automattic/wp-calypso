/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSite } from './';
import { LAUNCH_STORE, SITE_STORE } from '../stores';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export const useOnLaunch = () => {
	const { launchStatus } = useSite();
	const { plan, domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const { getCart, setCart } = useDispatch( SITE_STORE );

	React.useEffect( () => {
		if ( launchStatus ) {
			if ( plan && ! plan?.isFree ) {
				const planProduct = {
					product_id: plan.productId,
					product_slug: plan.storeSlug,
					extra: {
						source: 'gutenboarding',
					},
				};
				const domainProduct = {
					meta: domain?.domain_name,
					product_id: domain?.product_id,
					extra: {
						privacy_available: domain?.supports_privacy,
						privacy: domain?.supports_privacy,
						source: 'gutenboarding',
					},
				};

				const go = async () => {
					const cart = await getCart( window._currentSiteId );
					await setCart( window._currentSiteId, {
						...cart,
						products: [ ...cart.products, planProduct, domainProduct ],
					} );

					// TODO: reset store on launch

					// TODO: add paid upgrade flow without launch
					// const editorUrl = design?.is_fse
					// 	? `site-editor%2F${ newSite.site_slug }`
					// 	: `block-editor%2Fpage%2F${ newSite.site_slug }%2Fhome`;
					// window.location.href = `https://wordpress.com/checkout/${ window._currentSiteId }?preLaunch=1&isGutenboardingCreate=1&redirect_to=%2F${ editorUrl }`;

					window.top.location.href = `https://wordpress.com/checkout/${ window._currentSiteId }?preLaunch=1`;
				};

				// TODO: record tracks event
				go();
				return;
			}
			window.top.location.href = `https://wordpress.com/home/${ window._currentSiteId }`;
		}
	}, [ launchStatus ] );
};
