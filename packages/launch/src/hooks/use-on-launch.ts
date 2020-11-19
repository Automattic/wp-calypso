/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { useSite } from './';
import { LAUNCH_STORE, SITE_STORE, PLANS_STORE } from '../stores';
import LaunchContext from '../context';
import { Route } from '../focused-launch/route';

export const useOnLaunch = () => {
	const { siteId } = React.useContext( LaunchContext );
	const { launchStatus } = useSite();
	const { plan, domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const isEcommercePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanEcommerce( plan?.storeSlug )
	);

	const { getCart, setCart } = useDispatch( SITE_STORE );

	const history = useHistory();

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

					const checkoutUrl = addQueryArgs( `https://wordpress.com/checkout/${ siteId }`, {
						preLaunch: 1,
						// Redirect to My Home after checkout only if the selected plan is not eCommerce
						...( ! isEcommercePlan && { redirect_to: `/home/${ siteId }` } ),
					} );

					window.top.location.href = checkoutUrl;
				};

				// TODO: record tracks event
				go();
				return;
			}
			history
				? history.push( Route.Success )
				: ( window.top.location.href = `https://wordpress.com/home/${ siteId }` );
		}
	}, [ launchStatus ] ); // eslint-disable-line react-hooks/exhaustive-deps
};
