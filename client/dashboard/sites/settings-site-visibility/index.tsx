import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteSettingsSiteVisibilityRoute } from '../../app/router/sites';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SnackbarBackButton, {
	getSnackbarBackButtonText,
} from '../../components/snackbar-back-button';
import SiteLaunchCelebrationModal from '../site-launch-celebration-modal';
import { LaunchAgencyDevelopmentSiteForm, LaunchForm } from './launch-form';
import { PrivacyForm } from './privacy-form';
import { ShareSiteForm } from './share-site-form';

export default function SiteVisibilitySettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const { back_to } = useSearch( {
		from: siteSettingsSiteVisibilityRoute.fullPath,
	} );

	// Check if celebration modal should be shown based on URL param
	const searchQueryParams = window.location.search;
	const [ isCelebrationModalOpen, setIsCelebrationModalOpen ] = useState( false );

	useEffect( () => {
		const hasCelebrateLaunch = new URLSearchParams( searchQueryParams ).has( 'celebrateLaunch' );
		// Only open the modal if the param is present; closing is handled by onClose
		if ( hasCelebrateLaunch ) {
			setIsCelebrationModalOpen( true );
		}
	}, [ searchQueryParams ] );

	const renderContent = () => {
		if ( site.launch_status === 'unlaunched' ) {
			return (
				<>
					{ site.is_a4a_dev_site ? (
						<LaunchAgencyDevelopmentSiteForm site={ site } />
					) : (
						<LaunchForm site={ site } />
					) }
					{ site.is_coming_soon && <ShareSiteForm site={ site } /> }
				</>
			);
		}

		return <PrivacyForm site={ site } settings={ settings } />;
	};

	const renderBackButton = () => {
		const snackbarBackButtonText = getSnackbarBackButtonText( back_to );
		if ( ! snackbarBackButtonText ) {
			return null;
		}

		return <SnackbarBackButton>{ snackbarBackButtonText }</SnackbarBackButton>;
	};

	return (
		<>
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title={ __( 'Site visibility' ) }
						description={ createInterpolateElement(
							__( 'Control who can view your site. <learnMoreLink />' ),
							{
								learnMoreLink: <InlineSupportLink supportContext="privacy" />,
							}
						) }
					/>
				}
			>
				{ renderContent() }
				{ renderBackButton() }
			</PageLayout>
			{ isCelebrationModalOpen && (
				<SiteLaunchCelebrationModal
					site={ site }
					onClose={ () => setIsCelebrationModalOpen( false ) }
				/>
			) }
		</>
	);
}
