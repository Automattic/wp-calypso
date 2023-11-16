import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button, Popover } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import useCheckEligibilityMigrationTrialPlan from 'calypso/data/plans/use-check-eligibility-migration-trial-plan';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import UpgradePlanDetails from './upgrade-plan-details';
import type { URL } from 'calypso/types';

interface Props {
	sourceSiteUrl: URL;
	targetSite: SiteDetails;
	startImport: () => void;
	onFreeTrialClick: () => void;
	onContentOnlyClick: () => void;
	isBusy: boolean;
	migrationTrackingProps?: Record< string, unknown >;
}

export const PreMigrationUpgradePlan: React.FunctionComponent< Props > = ( props: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const plan = getPlan( PLAN_BUSINESS );
	const {
		sourceSiteUrl,
		targetSite,
		startImport,
		onFreeTrialClick,
		onContentOnlyClick,
		isBusy,
		migrationTrackingProps,
	} = props;
	const { data: migrationTrialEligibility } = useCheckEligibilityMigrationTrialPlan(
		targetSite.ID
	);
	const isEligibleForTrialPlan =
		migrationTrialEligibility?.eligible ||
		// If the user's email is unverified, we still want to show the trial plan option
		migrationTrialEligibility?.error_code === 'email-unverified';
	const [ popoverVisible, setPopoverVisible ] = useState( false );
	const trialBtnRef: React.RefObject< HTMLButtonElement > = useRef( null );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_site_migration_upgrade_plan_screen', migrationTrackingProps )
		);
	}, [] );

	return (
		<div className="import__import-everything import__import-everything--redesign">
			<div className="import__heading-title">
				<Title>{ translate( 'Upgrade your plan' ) }</Title>
				<SubTitle>
					{ translate( 'Migrating themes, plugins, users, and settings requires a %(plan)s plan', {
						args: {
							plan: plan?.getTitle() ?? '',
						},
					} ) }
				</SubTitle>
			</div>
			<p>
				{ translate(
					'Your entire site %(from)s will be migrated to %(to)s, overriding the content in your destination site',
					{
						args: {
							from: convertToFriendlyWebsiteName( sourceSiteUrl ),
							to: convertToFriendlyWebsiteName( targetSite.URL ),
						},
					}
				) }
			</p>
			<UpgradePlanDetails />
			<div className="import__footer-button-container">
				<NextButton isBusy={ isBusy } onClick={ () => startImport() }>
					{ translate( 'Upgrade and migrate' ) }
				</NextButton>
				{ isEnabled( 'plans/migration-trial' ) && (
					<Button
						ref={ trialBtnRef }
						busy={ isBusy }
						borderless={ true }
						className="action-buttons__borderless"
						onClick={ () => isEligibleForTrialPlan && onFreeTrialClick() }
						onFocus={ () => ! isEligibleForTrialPlan && setPopoverVisible( true ) }
						onBlur={ () => setPopoverVisible( false ) }
						onMouseEnter={ () => ! isEligibleForTrialPlan && setPopoverVisible( true ) }
						onMouseLeave={ () => setPopoverVisible( false ) }
					>
						{ translate( 'Try it for free' ) }
					</Button>
				) }
				{ ! isEligibleForTrialPlan && (
					<Button
						borderless={ true }
						className="action-buttons__borderless"
						onClick={ onContentOnlyClick }
					>
						{ translate( 'Use the content-only import option' ) }
					</Button>
				) }
			</div>

			<Popover
				className="info-popover__tooltip info-popover__tooltip--trial-plan"
				focusOnShow={ false }
				context={ trialBtnRef.current }
				isVisible={ popoverVisible }
			>
				{ translate(
					'Free trials are a one-time offer and you’ve already enrolled in one in the past.'
				) }
			</Popover>
		</div>
	);
};
