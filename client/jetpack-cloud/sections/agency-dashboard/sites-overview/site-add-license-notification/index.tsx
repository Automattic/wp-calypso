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
		const initialLicenseList = licenseNames.slice( 0, -1 );
		const lastLicenseItem = licenseNames.slice( -1 )[ 0 ];
		const commaCharacter = translate( ',' );
		const conjunction =
			licenses.length > 2
				? translate( `%(commaCharacter)s and`, { args: { commaCharacter } } )
				: translate( ' and' );
		return {
			args: {
				selectedSite,
				...( licenses.length > 1
					? {
							initialLicenseList: initialLicenseList.join( `${ commaCharacter } ` ),
							lastLicenseItem: lastLicenseItem,
							conjunction,
					  }
					: { licenseItem: lastLicenseItem } ),
			},
			...( licenses.length > 1 && {
				comment: `%(initialLicenseList)s is a list of n-1 license names
						seperated by a translated comma character, %(lastLicenseItem)
						is the nth license name, and %(conjunction) is a translated "and"
						text with or without a serial comma based on the licenses count`,
			} ),
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
										'{{strong}}%(initialLicenseList)s%(conjunction)s %(lastLicenseItem)s{{/strong}} ' +
											'were succesfully assigned to {{em}}%(selectedSite)s{{/em}}. ' +
											'Please allow a few minutes for your features to activate.',
										getMessageArgs( assignedLicenses )
								  )
								: translate(
										'{{strong}}%(licenseItem)s{{/strong}} was succesfully assigned to ' +
											'{{em}}%(selectedSite)s{{/em}}. Please allow a few minutes ' +
											'for your features to activate.',
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
										'An error occurred and your {{strong}}%(initialLicenseList)s%(conjunction)s %(lastLicenseItem)s{{/strong}} ' +
											"weren't assigned to {{em}}%(selectedSite)s{{/em}}.",
										getMessageArgs( rejectedLicenses )
								  )
								: translate(
										'An error occurred and your {{strong}}%(licenseItem)s{{/strong}} ' +
											"wasn't assigned to {{em}}%(selectedSite)s{{/em}}.",
										getMessageArgs( rejectedLicenses )
								  )
						}
					</Notice>
				</div>
			) }
		</>
	);
}
