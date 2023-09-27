import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import Notice from 'calypso/components/notice';
import { useDispatch, useSelector } from 'calypso/state';
import { setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { getPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { WPCOM_HOSTING } from '../lib/constants';
import { ProductInfo } from '../types';
import WPCOMAtomicHostingNotification from './wpcom-atomic-hosting-notification';

import './style.scss';

export default function SiteAddLicenseNotification() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const licensesAdded = useSelector( getPurchasedLicense );

	// Dismiss the banner once this component unloads
	useEffect( () => {
		return () => {
			dispatch( setPurchasedLicense() );
		};
	}, [ dispatch ] );

	if ( ! licensesAdded || ! licensesAdded.selectedSite ) {
		return null;
	}

	const { selectedSite, selectedProducts, type } = licensesAdded;

	if ( type === WPCOM_HOSTING ) {
		return <WPCOMAtomicHostingNotification licensesAdded={ licensesAdded } />;
	}

	const assignedLicenses = selectedProducts.filter( ( product ) => product.status === 'fulfilled' );
	const rejectedLicenses = selectedProducts.filter( ( product ) => product.status === 'rejected' );

	const clearLicenses = ( type: 'fulfilled' | 'rejected' ) => {
		const license = {
			...licensesAdded,
			selectedProducts: selectedProducts.filter( ( product ) => product.status !== type ),
		};
		dispatch( setPurchasedLicense( license.selectedProducts.length ? license : undefined ) );
	};

	function getTranslatedLicenseAssignmentMessage(
		licenses: Array< ProductInfo >,
		type: 'fulfilled' | 'rejected'
	) {
		const licenseNames = licenses.map( ( license ) => license.name );
		const initialLicenseList = licenseNames.slice( 0, -1 );
		const lastLicenseItem = licenseNames.slice( -1 )[ 0 ];

		const commaCharacter = translate( ',', {
			comment:
				'The character used to separate items in a list, such as the comma in "Backup, Scan, and Boost".',
		} );
		const conjunction =
			licenses.length > 2
				? translate( '%(commaCharacter)s and ', {
						args: {
							commaCharacter,
							comment:
								'The final separator of a delimited list, such as ", and " in "Backup, Scan, and Boost". Note that the spaces here are important due to the way the final string is constructed.',
						},
				  } )
				: translate( ' and ', {
						args: {
							comment:
								'The way that two words are separated, such as " and " in "Backup and Scan". Note that the spaces here are important due to the way the final string is constructed.',
						},
				  } );
		const multipleLicensesArgs = {
			selectedSite,
			initialLicenseList: initialLicenseList.join( `${ commaCharacter } ` ),
			lastLicenseItem: lastLicenseItem,
			conjunction,
		};
		const singleLicenseArgs = {
			selectedSite,
			licenseItem: lastLicenseItem,
		};
		const components = {
			strong: <strong />,
			em: <em />,
		};

		if ( type === 'fulfilled' ) {
			// We are not using the same translate method for plural form since we have different arguments.
			return licenses.length > 1
				? translate(
						'{{strong}}%(initialLicenseList)s%(conjunction)s%(lastLicenseItem)s{{/strong}} ' +
							'were successfully assigned to {{em}}%(selectedSite)s{{/em}}. ' +
							'Please allow a few minutes for your features to activate.',
						{
							args: multipleLicensesArgs,
							comment:
								'%(initialLicenseList)s is a list of n-1 license names seperated by a translated comma character, %(lastLicenseItem) is the nth license name, and %(conjunction) is a translated "and" text with or without a serial comma based on the licenses count. An example is "Backup, Scan, and Boost" where the initialLicenseList is "Backup, Scan", the conjunction is ", and", and the lastLicenseItem is "Boost". An alternative example is "Backup and Scan", where initialLicenseList is "Backup", conjunction is " and", and lastLienseItem is "Boost".',
							components,
						}
				  )
				: translate(
						'{{strong}}%(licenseItem)s{{/strong}} was successfully assigned to ' +
							'{{em}}%(selectedSite)s{{/em}}. Please allow a few minutes ' +
							'for your features to activate.',
						{
							args: singleLicenseArgs,
							components,
						}
				  );
		}
		// We are not using the same translate method for plural form since we have different arguments.
		return licenses.length > 1
			? translate(
					'An error occurred and your {{strong}}%(initialLicenseList)s%(conjunction)s%(lastLicenseItem)s{{/strong}} ' +
						"weren't assigned to {{em}}%(selectedSite)s{{/em}}.",
					{
						args: multipleLicensesArgs,
						comment:
							'%(initialLicenseList)s is a list of n-1 license names seperated by a translated comma character, %(lastLicenseItem) is the nth license name, and %(conjunction) is a translated "and" text with or without a serial comma based on the licenses count. An example is "Backup, Scan, and Boost" where the initialLicenseList is "Backup, Scan", the conjunction is ", and", and the lastLicenseItem is "Boost". An alternative example is "Backup and Scan", where initialLicenseList is "Backup", conjunction is " and", and lastLienseItem is "Boost".',
						components,
					}
			  )
			: translate(
					'An error occurred and your {{strong}}%(licenseItem)s{{/strong}} ' +
						"wasn't assigned to {{em}}%(selectedSite)s{{/em}}.",
					{
						args: singleLicenseArgs,
						components,
					}
			  );
	}

	return (
		<>
			{ assignedLicenses.length > 0 && (
				<div className="site-add-license-notification__license-banner">
					<Notice onDismissClick={ () => clearLicenses( 'fulfilled' ) } status="is-success">
						{ getTranslatedLicenseAssignmentMessage( assignedLicenses, 'fulfilled' ) }
					</Notice>
				</div>
			) }
			{ rejectedLicenses.length > 0 && (
				<div className="site-add-license-notification__license-banner">
					<Notice onDismissClick={ () => clearLicenses( 'rejected' ) } status="is-error">
						{ getTranslatedLicenseAssignmentMessage( rejectedLicenses, 'rejected' ) }
					</Notice>
				</div>
			) }
		</>
	);
}
