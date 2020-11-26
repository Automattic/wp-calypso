/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { useSite } from './';
import { LAUNCH_STORE, SITE_STORE, PLANS_STORE } from '../stores';
import LaunchContext from '../context';
import { getPlanProduct, getDomainProduct } from '../utils';

// Hook used exclusively in Step-by-step launch flow
export const useOnLaunch = () => {
	const { siteId, flow, redirectTo } = React.useContext( LaunchContext );

	const { plan, domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const isEcommercePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanEcommerce( plan?.storeSlug )
	);

	const { getCart, setCart } = useDispatch( SITE_STORE );

	const { isSiteLaunched } = useSite();

	React.useEffect( () => {
		if ( isSiteLaunched ) {
			if ( plan && ! plan?.isFree ) {
				const planProduct = getPlanProduct( plan, flow );
				const domainProduct = domain && getDomainProduct( domain, flow );

				const go = async () => {
					const cart = await getCart( siteId );
					await setCart( siteId, {
						...cart,
						products: [ ...cart.products, planProduct, domainProduct ],
					} );

					// TODO: reset store on launch

					// TODO: add paid upgrade flow without launch
					// const editorUrl = design?.is_fse
					// 	? `site-editor%2F${ newSite.site_slug }`
					// 	: `block-editor%2Fpage%2F${ newSite.site_slug }%2Fhome`;
					// window.location.href = `https://wordpress.com/checkout/${ siteId }?preLaunch=1&isGutenboardingCreate=1&redirect_to=%2F${ editorUrl }`;

					const checkoutUrl = addQueryArgs( `/checkout/${ siteId }`, {
						preLaunch: 1,
						// Redirect to My Home after checkout only if the selected plan is not eCommerce
						...( ! isEcommercePlan && { redirect_to: `/home/${ siteId }` } ),
					} );

					redirectTo( checkoutUrl );
				};

				// TODO: record tracks event
				go();
				return;
			}
			redirectTo( `/home/${ siteId }` );
		}
	}, [ isSiteLaunched ] ); // eslint-disable-line react-hooks/exhaustive-deps
};
