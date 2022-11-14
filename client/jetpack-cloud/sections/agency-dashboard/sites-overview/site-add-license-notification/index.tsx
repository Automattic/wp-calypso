import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { getPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { ProductInfo } from '../types';

import './style.scss';

export default function SiteAddLicenseNotification() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const licenseInfo = useSelector( getPurchasedLicense );

	const dismissBanner = useCallback( () => {
		dispatch( setPurchasedLicense() );
	}, [ dispatch ] );

	useEffect( () => {
		return () => {
			dismissBanner();
		};
	}, [ dismissBanner ] );

	if ( ! licenseInfo || ! licenseInfo.selectedSite ) {
		return null;
	}

	const { selectedSite, selectedProducts } = licenseInfo;
	const assignedLicenses = selectedProducts.filter( ( product ) => product.status === 'fulfilled' );
	const rejectedLicenses = selectedProducts.filter( ( product ) => product.status === 'rejected' );

	const clearLicenses = ( type: 'fulfilled' | 'rejected' ) => {
		const license = {
			...licenseInfo,
			selectedProducts: selectedProducts.filter( ( product ) => product.status !== type ),
		};
		dispatch( setPurchasedLicense( license.selectedProducts.length ? license : undefined ) );
	};

	function getMessageArgs( licenses: Array< ProductInfo > ) {
		const licenseNames = licenses.map( ( license ) => license.name );
		const lastItem = licenseNames.slice( -1 )[ 0 ];
		const remainingItems = licenseNames.slice( 0, -1 );
		return {
			args: {
				lastItem: lastItem,
				selectedSite,
				remainingItems: remainingItems.join( ', ' ),
			},
			components: {
				strong: <strong />,
				em: <em />,
			},
		};
	}

	return (
		<>
			{ assignedLicenses.length > 0 && (
				<div className="site-add-license-notification__license-banner">
					<Notice onDismissClick={ () => clearLicenses( 'fulfilled' ) } status="is-success">
						{
							// We are not using the same translate method for plural form since we have different arguments.
							assignedLicenses.length > 1
								? translate(
										'{{strong}}%(remainingItems)s and %(lastItem)s{{/strong}} were succesfully assigned to {{em}}%(selectedSite)s{{/em}}. Please allow a few minutes for your features to activate.',
										getMessageArgs( assignedLicenses )
								  )
								: translate(
										'{{strong}}%(lastItem)s{{/strong}} was succesfully assigned to {{em}}%(selectedSite)s{{/em}}. Please allow a few minutes for your features to activate.',
										getMessageArgs( assignedLicenses )
								  )
						}
					</Notice>
				</div>
			) }
			{ rejectedLicenses.length > 0 && (
				<div className="site-add-license-notification__license-banner">
					<Notice onDismissClick={ () => clearLicenses( 'rejected' ) } status="is-error">
						{
							// We are not using the same translate method for plural form since we have different arguments.
							rejectedLicenses.length > 1
								? translate(
										`An error occurred and your {{strong}}%(remainingItems)s and %(lastItem)s{{/strong}} weren't assigned to {{em}}%(selectedSite)s{{/em}}.`,
										getMessageArgs( rejectedLicenses )
								  )
								: translate(
										`An error occurred and your {{strong}}%(lastItem)s{{/strong}} wasn't assigned to {{em}}%(selectedSite)s{{/em}}.`,
										getMessageArgs( rejectedLicenses )
								  )
						}
					</Notice>
				</div>
			) }
		</>
	);
}
