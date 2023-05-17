import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import ConfirmUpgradePlan from './confirm-upgrade-plan';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	sourceSite: SiteDetails | null;
	sourceSiteUrl: string;
	targetSite: SiteDetails | null;
	targetSiteSlug: string;
	isTargetSitePlanCompatible: boolean;
	startImport: () => void;
	onContentOnlyClick: () => void;
}

export const MigrateReady: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const plan = getPlan( PLAN_BUSINESS );
	/**
	 ↓ Fields
	 */
	const {
		sourceSite,
		sourceSiteUrl,
		targetSite,
		targetSiteSlug,
		isTargetSitePlanCompatible,
		startImport,
		onContentOnlyClick,
	} = props;

	/**
	 ↓ Effects
	 */
	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_confirmation' );
	}, [] );

	/**
	 ↓ Functions
	 */
	function startImportCta() {
		recordTracksEvent( 'calypso_signup_step_start', {
			flow: 'importer',
			step: 'importerWordpress',
			action: 'startImport',
		} );
		startImport();
	}

	function onMigrationMethodToggle() {
		// place holder for future use
	}

	return (
		<>
			<div
				className={ classnames( 'import__import-everything', {
					'import__import-everything--redesign': isEnabled( 'onboarding/import-redesign' ),
				} ) }
			>
				<>
					{ ! isTargetSitePlanCompatible && (
						<>
							<div className="import__heading-title">
								<Title>Upgrade your plan</Title>
								<SubTitle>
									{ sprintf(
										/* translators: the `plan` should be the title of the plan */
										__( 'Migrating themes, plugins, users, and settings requires a %(plan)s plan' ),
										{
											plan: plan?.getTitle(),
										}
									) }
								</SubTitle>
							</div>
							<p>
								{ sprintf(
									/* translators: the `from` and `to` fields could be any site URL (eg: "yourname.com") */
									__(
										'Your entire site %(from)s will be migrated to %(to)s, overriding the content in your destination site'
									),
									{
										from: convertToFriendlyWebsiteName( sourceSiteUrl ),
										to: convertToFriendlyWebsiteName( targetSiteSlug ),
									}
								) }
							</p>
							<ConfirmUpgradePlan sourceSite={ sourceSite } targetSite={ targetSite } />
							<div className="import__footer-button-container">
								<NextButton onClick={ () => startImport() }>
									{ __( 'Upgrade and migrate' ) }
								</NextButton>
								<Button
									borderless={ true }
									className="action-buttons__content-only"
									onClick={ onContentOnlyClick }
								>
									{ __( 'Use the content-only import option' ) }
								</Button>
							</div>
						</>
					) }

					{ isTargetSitePlanCompatible && (
						<>
							<div className="import__heading-title">
								<Title>You are ready to migrate</Title>
								<SubTitle>
									{ sprintf(
										/* translators: the `from` and `to` fields could be any site URL (eg: "yourname.com") */
										__( 'Your entire site %(from)s will be migrated to %(to)s' ),
										{
											from: convertToFriendlyWebsiteName( sourceSiteUrl ),
											to: convertToFriendlyWebsiteName( targetSiteSlug ),
										}
									) }
								</SubTitle>
							</div>
							<p className="import__note">
								{ translate(
									'Optionally, {{serverCredentialCta}}provide the server credentials{{/serverCredentialCta}} of your site to speed up the migration.',
									{
										components: {
											serverCredentialCta: (
												<Button
													className="action-buttons__migration-method-cta"
													borderless={ true }
													onClick={ onMigrationMethodToggle }
												/>
											),
										},
									}
								) }
							</p>
							<div className="import__footer-button-container">
								<NextButton onClick={ startImportCta }>{ __( 'Start migration' ) }</NextButton>
							</div>
						</>
					) }
				</>
			</div>
		</>
	);
};
