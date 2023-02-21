/* eslint-disable no-console */
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import type { Step, PluginsResponse } from '../../types';
import './styles.scss';

const CheckForWoo: Step = function CheckForWoo( { navigation } ) {
	const { submit } = navigation;
	const site = useSite();

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		const checkForWoo = async () => {
			const response: PluginsResponse = await wpcomRequest( {
				path: `/sites/${ site?.ID }/plugins`,
				apiVersion: '1.1',
			} );

			const hasWooCommerce =
				response?.plugins.find( ( plugin: { slug: string } ) => plugin.slug === 'woocommerce' ) !==
				undefined;

			submit?.( { hasWooCommerce } );
		};

		checkForWoo();

		// We don't need to include `submit` in the dependency array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ site ] );

	return (
		<div className="step-container">
			<div className="step-container__content">
				<LoadingEllipsis />
			</div>
		</div>
	);
};

export default CheckForWoo;
