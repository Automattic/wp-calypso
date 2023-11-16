import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import checkIcon from 'calypso/assets/images/jetpack/jetpack-green-checkmark.svg';
import Banner from 'calypso/components/banner';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import type { PurchasedProductsInfo } from '../types';

export default function WPCOMAtomicHostingNotification( {
	licensesAdded,
}: {
	licensesAdded: PurchasedProductsInfo;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedSite, selectedProducts } = licensesAdded;

	const licenseItem = selectedProducts[ 0 ].name;

	const handleOnClick = ( eventName: string ) => {
		dispatch(
			recordTracksEvent( eventName, {
				site: selectedSite,
				licenseItem,
			} )
		);
		dispatch( setPurchasedLicense() );
	};

	const siteSlug = urlToSlug( selectedSite );

	useEffect( () => {
		// Track event when this notification is displayed.
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_dashboard_wpcom_hosting_notification_view', {
				site: selectedSite,
				licenseItem,
			} )
		);
	}, [ dispatch, licenseItem, selectedSite ] );

	const extraContent = (
		<div className="site-add-license-notification__license-banner-wp-buttons">
			<Button
				href={ `https://wordpress.com/home/${ siteSlug }` }
				primary
				target="_blank"
				onClick={ () =>
					handleOnClick( 'calypso_jetpack_agency_dashboard_setup_site_in_wp_admin_click' )
				}
			>
				{ translate( 'Set up site in wp-admin' ) }
				<span>
					<Gridicon icon="external" size={ 18 } />
				</span>
			</Button>

			<Button
				borderless
				target="_blank"
				href={ `https://wordpress.com/domains/manage/${ siteSlug }` }
				onClick={ () => handleOnClick( 'calypso_jetpack_agency_dashboard_change_domain_click' ) }
			>
				{ translate( 'Change domain' ) }
				<span>
					<Gridicon icon="external" size={ 24 } />
				</span>
			</Button>
		</div>
	);

	return (
		<div className="site-add-license-notification__license-banner-wp">
			<Banner
				dismissWithoutSavingPreference
				title={ translate(
					"Congratulations! You've successfully purchased the %(licenseItem)s License.",
					{
						args: {
							licenseItem,
						},
						comment: '%(licenseItem)s is the license name, such as "WordPress Business".',
					}
				) }
				description={ translate(
					"Start by setting up or freely switch your temporary domain to your preferred one. It's time to create your masterpiece!"
				) }
				disableCircle
				horizontal
				iconPath={ checkIcon }
				onDismiss={ () =>
					handleOnClick( 'calypso_jetpack_agency_dashboard_wpcom_hosting_notification_dismiss' )
				}
				extraContent={ extraContent }
			/>
		</div>
	);
}
