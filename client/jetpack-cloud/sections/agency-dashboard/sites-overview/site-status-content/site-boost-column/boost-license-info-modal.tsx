import { Button, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect } from 'react';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../../hooks';
import DashboardDataContext from '../../dashboard-data-context';
import useInstallBoost from '../../hooks/use-install-boost';
import LicenseInfoModal from '../../license-info-modal';
import type { Site } from '../../types';

import './style.scss';

interface Props {
	onClose: () => void;
	site: Site;
	upgradeOnly?: boolean;
}

export default function BoostLicenseInfoModal( { onClose, site, upgradeOnly }: Props ) {
	const translate = useTranslate();
	const isA4AEnabled = isA8CForAgencies();

	const { isLargeScreen } = useContext( DashboardDataContext );

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], isLargeScreen );

	const { blog_id: siteId, url: siteUrl, is_atomic, url_with_scheme } = site;

	const { installBoost, status } = useInstallBoost( siteId, siteUrl );

	const handleInstallBoost = () => {
		installBoost();
		recordEvent( 'boost_info_modal_start_free_click' );
	};

	const handlePurchaseBoost = () => {
		recordEvent( 'boost_info_modal_purchase_click' );
	};

	const onJetpackBoostClick = () => {
		recordEvent( 'boost_info_modal_jetpack_boost_click' );
	};

	const inProgress = status === 'loading';

	useEffect( () => {
		if ( status === 'success' ) {
			onClose();
		}
	}, [ status, onClose ] );

	const productPurchaseLink = isA4AEnabled
		? `${ A4A_MARKETPLACE_CHECKOUT_LINK }?product_slug=jetpack-boost&source=sitesdashboard&site_id=${ siteId }`
		: '#';

	return (
		<LicenseInfoModal
			className="site-boost-column__upgrade-modal"
			currentLicenseInfo="boost"
			label={
				upgradeOnly
					? translate( 'Upgrade to auto-optimize' )
					: translate( 'Purchase Boost License' )
			}
			onClose={ onClose }
			siteId={ siteId }
			onCtaClick={ handlePurchaseBoost }
			isCTAExternalLink={ is_atomic }
			ctaHref={
				is_atomic
					? `${ url_with_scheme }/wp-admin/admin.php?page=jetpack#/dashboard`
					: productPurchaseLink
			}
			showPaymentPlan={ ! is_atomic }
			extraAsideContent={
				<>
					{ ! upgradeOnly && (
						<Button
							disabled={ inProgress }
							className="site-boost-column__extra-button"
							onClick={ handleInstallBoost }
						>
							{ translate( 'Start Free' ) }
						</Button>
					) }

					{ ! upgradeOnly && (
						<div className="site-boost-column__notice">
							{ translate( 'Proceeding installs {{jetpackBoostLink/}} on your website.', {
								args: { siteUrl },
								comment: '%(siteUrl)s is the site url. Eg: example.com',
								components: {
									jetpackBoostLink: (
										<ExternalLink
											href="https://wordpress.org/plugins/jetpack-boost/"
											onClick={ onJetpackBoostClick }
											icon
										>
											{ translate( 'Jetpack Boost' ) }
										</ExternalLink>
									),
								},
							} ) }
						</div>
					) }
				</>
			}
			isDisabled={ inProgress }
		/>
	);
}
