import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useMemo } from 'react';
import ExternalLink from 'calypso/components/external-link';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../../hooks';
import SitesOverviewContext from '../../context';
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

	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );
	const { isLargeScreen } = useContext( DashboardDataContext );

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], isLargeScreen );

	const { blog_id: siteId, url: siteUrl } = site;

	// queryKey is needed to optimistically update the site list
	const queryKey = useMemo(
		() => [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ],
		[ filter, search, currentPage, sort ]
	);
	const { installBoost, status } = useInstallBoost( siteId, siteUrl, queryKey );

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

	return (
		<LicenseInfoModal
			className="site-boost-column__upgrade-modal"
			currentLicenseInfo="boost"
			label={
				upgradeOnly
					? translate( 'Upgrade to Auto-optimize' )
					: translate( 'Purchase Boost License' )
			}
			onClose={ onClose }
			siteId={ siteId }
			onCtaClick={ handlePurchaseBoost }
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
											icon={ true }
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
