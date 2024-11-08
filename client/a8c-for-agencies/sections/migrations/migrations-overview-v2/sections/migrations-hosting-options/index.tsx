import { Button, Card } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { A4A_MARKETPLACE_HOSTING_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useFetchDevLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-licenses';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import PressableBanner from 'calypso/assets/images/a8c-for-agencies/pressable-card-banner.svg';
import WPCOMBanner from 'calypso/assets/images/a8c-for-agencies/wpcom-card-banner.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const PRESSABLE_CONTACT_LINK = 'https://pressable.com/request-demo';

function HostingOptionCard( {
	banner,
	title,
	description,
	footnote,
	buttons,
}: {
	banner: string;
	title: TranslateResult;
	description: TranslateResult;
	footnote?: TranslateResult;
	buttons: React.ReactNode;
} ) {
	return (
		<Card className="migrations-hosting-options-card">
			<img src={ banner } alt="" className="migrations-hosting-options-card__banner" />
			<div className="migrations-hosting-options-card__content">
				<h3 className="migrations-hosting-options-card__title">{ title }</h3>
				<p className="migrations-hosting-options-card__description">{ description }</p>
				{ footnote && (
					<span className="migrations-hosting-options-card__footnote">{ footnote }</span>
				) }
			</div>
			<div className="migrations-hosting-options-card__footer">{ buttons }</div>
		</Card>
	);
}

export default function MigrationsHostingOptions() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data: devLicenses } = useFetchDevLicenses();

	const availableDevSites = devLicenses?.available;

	const [ showWPCOMDevSiteConfigurationsModal, setShowWPCOMDevSiteConfigurationsModal ] =
		useState( false );

	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();

	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	const onSchedulePressableDemoClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_migrations_hosting_options_schedule_pressable_demo_click' )
		);
	}, [ dispatch ] );

	const onClickCreateWPCOMDevSite = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_migrations_hosting_options_create_wpcom_dev_site_click' )
		);
		setShowWPCOMDevSiteConfigurationsModal( true );
	}, [ dispatch, setShowWPCOMDevSiteConfigurationsModal ] );

	const onHideWPCOMDevSiteConfigurationsModal = useCallback( () => {
		setShowWPCOMDevSiteConfigurationsModal( false );
	}, [ setShowWPCOMDevSiteConfigurationsModal ] );

	const onClickHostingMarketplaceLink = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_migrations_hosting_options_hosting_marketplace_link_click' )
		);
	}, [ dispatch ] );

	return (
		<PageSection
			heading={ translate( 'Unsure which host suits your needs?' ) }
			description={ translate( 'Take WordPress.com and Pressable for a spin.' ) }
		>
			<div className="migrations-hosting-options__container">
				<HostingOptionCard
					banner={ WPCOMBanner }
					title={ translate( 'Start building for free' ) }
					description={ translate(
						'Included in your membership to Automattic for Agencies. Develop up to 5 WordPress.com sites at once with free development licenses. Only pay when you launch!'
					) }
					footnote={ translate( '%(pendingSites)d of 5 free licenses available', {
						args: {
							pendingSites: availableDevSites,
						},
						comment: '%(pendingSites)s is the number of free licenses available.',
					} ) }
					buttons={ [
						<Button
							variant="secondary"
							key="create-dev-site-cta-button"
							disabled={ ! availableDevSites }
							onClick={ onClickCreateWPCOMDevSite }
						>
							{ translate( 'Create a development site →' ) }
						</Button>,
					] }
				/>

				<HostingOptionCard
					banner={ PressableBanner }
					title={ translate( 'Schedule a demo' ) }
					description={ translate(
						'Our friendly experts are happy to give you a personalized one-on-one tour of our platform to discuss your needs and everything Pressable has to offer.'
					) }
					buttons={ [
						<Button
							variant="secondary"
							key="schedule-pressable-demo-button"
							href={ PRESSABLE_CONTACT_LINK }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ onSchedulePressableDemoClick }
						>
							{ translate( 'Schedule a demo' ) } <Icon icon={ external } size={ 16 } />
						</Button>,
					] }
				/>
			</div>

			<div className="migrations-hosting-options__footnote">
				{ translate(
					'Need more details? Compare WordPress.com and Pressable plans on the {{a}}hosting marketplace{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ A4A_MARKETPLACE_HOSTING_LINK }
									onClick={ onClickHostingMarketplaceLink }
								/>
							),
						},
					}
				) }
			</div>

			{ showWPCOMDevSiteConfigurationsModal && (
				<SiteConfigurationsModal
					closeModal={ onHideWPCOMDevSiteConfigurationsModal }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
				/>
			) }
		</PageSection>
	);
}
