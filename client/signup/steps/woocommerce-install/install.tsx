import { Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { fetchSitePlugins, installPlugin } from 'calypso/state/plugins/installed/actions';
import { isRequesting, getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
// import { isRequestingSite, getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { GoToStep } from '../../types';
// import type { AppState } from 'calypso/types';

interface Props {
	goToStep: GoToStep;
}

export default function Install( { goToStep }: Props ): ReactElement | null {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId ) as number;

	useEffect( () => {
		dispatch( fetchSitePlugins( siteId ) );
	}, [ dispatch, siteId ] );

	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );

	const wooInstalled = !! useSelector( ( state ) =>
		getPluginOnSite( state, siteId, 'woocommerce' )
	);

	const wooPayInstalled = !! useSelector( ( state ) =>
		getPluginOnSite( state, siteId, 'woocommerce-payments' )
	);

	// const pluginsRequired = [
	// 	{ id: 'woocommerce/woocommerce', slug: 'woocommerce' },
	// 	// {
	// 	// 	id: 'woocommerce-payments/woocommerce-payments',
	// 	// 	slug: 'woocommerce-payments',
	// 	// },
	// ];

	useEffect( () => {
		if ( isRequestingPlugins ) {
			return;
		}
		if ( ! wooInstalled ) {
			dispatch( installPlugin( siteId, { id: 'woocommerce/woocommerce', slug: 'woocommerce' } ) );
		}

		// if ( ! wooPayInstalled ) {
		// 	dispatch(
		// 		installPlugin( siteId, {
		// 			id: 'woocommerce-payments/woocommerce-payments',
		// 			slug: 'woocommerce-payments',
		// 		} )
		// 	);
		// }
	}, [ wooInstalled, wooPayInstalled, isRequestingPlugins, dispatch, siteId ] );

	useEffect( () => {
		if ( wooInstalled /*&& wooPayInstalled*/ ) {
			goToStep( 'complete' );
		}
	}, [ wooInstalled, wooPayInstalled, goToStep ] );

	return (
		<>
			<div className="woocommerce-install__heading-wrapper">
				<div className="woocommerce-install__heading">
					<Title>{ __( 'Installing WooCommerce…' ) }</Title>
				</div>
			</div>
			<div className="woocommerce-install__content">
				<div>
					<LoadingEllipsis />
				</div>
			</div>
		</>
	);
}
