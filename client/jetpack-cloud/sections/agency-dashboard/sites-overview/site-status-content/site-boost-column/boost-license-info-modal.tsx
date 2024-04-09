import { isEnabled } from '@automattic/calypso-config';
import { Button, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useMemo } from 'react';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { CART_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/sections/marketplace/shopping-cart';
import { getSelectedFilters } from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/get-selected-filters';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
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
	const isA4AEnabled = isEnabled( 'a8c-for-agencies' );

	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );

	const { sitesViewState, showOnlyFavorites } = useContext( SitesDashboardContext );

	const { isLargeScreen } = useContext( DashboardDataContext );

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( [ site ], isLargeScreen );

	const { blog_id: siteId, url: siteUrl, is_atomic, url_with_scheme } = site;

	const agencyId = useSelector( getActiveAgencyId );

	// queryKey is needed to optimistically update the site list
	const queryKey = useMemo(
		() =>
			isA4AEnabled
				? [
						'jetpack-agency-dashboard-sites',
						sitesViewState?.search,
						sitesViewState?.page,
						{
							issueTypes: getSelectedFilters( sitesViewState?.filters ),
							showOnlyFavorites: showOnlyFavorites || false,
						},
						sitesViewState.sort,
						sitesViewState?.perPage,
						...( agencyId ? [ agencyId ] : [] ),
				  ]
				: [
						'jetpack-agency-dashboard-sites',
						search,
						currentPage,
						filter,
						sort,
						...( agencyId ? [ agencyId ] : [] ),
				  ],
		[
			isA4AEnabled,
			sitesViewState?.search,
			sitesViewState?.page,
			sitesViewState?.filters,
			sitesViewState.sort,
			sitesViewState?.perPage,
			showOnlyFavorites,
			agencyId,
			search,
			currentPage,
			filter,
			sort,
		]
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

	const productPurchaseLink = isA4AEnabled
		? `${ A4A_MARKETPLACE_PRODUCTS_LINK }?product_slug=jetpack-boost&source=sitesdashboard&site_id=${ siteId }${ CART_URL_HASH_FRAGMENT }`
		: undefined;

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
