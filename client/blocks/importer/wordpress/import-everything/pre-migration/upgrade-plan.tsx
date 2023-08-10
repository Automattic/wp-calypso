import { isEnabled } from '@automattic/calypso-config';
import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import { URL } from 'calypso/types';
import ConfirmUpgradePlan from './../confirm-upgrade-plan';

interface Props {
	sourceSiteSlug: string;
	sourceSiteUrl: URL;
	targetSite: SiteDetails;
	startImport: () => void;
	onFreeTrialClick: () => void;
	onContentOnlyClick: () => void;
	isBusy: boolean;
}

export const PreMigrationUpgradePlan: React.FunctionComponent< Props > = ( props: Props ) => {
	const translate = useTranslate();
	const plan = getPlan( PLAN_BUSINESS );
	const {
		sourceSiteSlug,
		sourceSiteUrl,
		targetSite,
		startImport,
		onFreeTrialClick,
		onContentOnlyClick,
		isBusy,
	} = props;

	return (
		<div
			className={ classnames( 'import__import-everything', {
				'import__import-everything--redesign': isEnabled( 'onboarding/import-redesign' ),
			} ) }
		>
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
			<ConfirmUpgradePlan sourceSiteSlug={ sourceSiteSlug } targetSite={ targetSite } />
			<div className="import__footer-button-container">
				<NextButton isBusy={ isBusy } onClick={ () => startImport() }>
					{ translate( 'Upgrade and migrate' ) }
				</NextButton>
				{ isEnabled( 'plans/migration-trial' ) && (
					<Button
						borderless={ true }
						className="action-buttons__borderless"
						onClick={ onFreeTrialClick }
					>
						{ translate( 'Try it for free' ) }
					</Button>
				) }
				<Button
					borderless={ true }
					className="action-buttons__borderless"
					onClick={ onContentOnlyClick }
				>
					{ translate( 'Use the content-only import option' ) }
				</Button>
			</div>
		</div>
	);
};
