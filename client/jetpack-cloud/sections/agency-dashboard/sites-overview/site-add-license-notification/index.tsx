import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { getPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/selectors';

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

	return (
		<>
			{ assignedLicenses.length > 0 && (
				<div className="site-add-license-notification__license-banner">
					<Notice onDismissClick={ () => clearLicenses( 'fulfilled' ) } status="is-success">
						{ translate(
							'{{strong}}%(assignedLicenses)s{{/strong}} was succesfully assigned to {{em}}%(selectedSite)s{{/em}}. Please allow few minutes for your features to activate.',
							'{{strong}}%(assignedLicenses)s{{/strong}} were succesfully assigned to {{em}}%(selectedSite)s{{/em}}. Please all a few minutes for your features to activate.',

							{
								count: assignedLicenses.length,
								args: {
									assignedLicenses: assignedLicenses
										.map( ( license ) => license.name )
										.join( ', ' ),
									selectedSite,
								},
								components: {
									strong: <strong />,
									em: <em />,
								},
							}
						) }
					</Notice>
				</div>
			) }
			{ rejectedLicenses.length > 0 && (
				<div className="site-add-license-notification__license-banner">
					<Notice onDismissClick={ () => clearLicenses( 'rejected' ) } status="is-error">
						{ translate(
							`An error occurred and your {{strong}}%(rejectedLicenses)s{{/strong}} wasn't assigned to {{em}}%(selectedSite)s{{/em}}.`,
							`An error occurred and your {{strong}}%(rejectedLicenses)s{{/strong}} weren't assigned to {{em}}%(selectedSite)s{{/em}}.`,
							{
								count: rejectedLicenses.length,
								args: {
									rejectedLicenses: rejectedLicenses
										.map( ( license ) => license.name )
										.join( ', ' ),
									selectedSite,
								},
								components: {
									strong: <strong />,
									em: <em />,
								},
							}
						) }
					</Notice>
				</div>
			) }
		</>
	);
}
