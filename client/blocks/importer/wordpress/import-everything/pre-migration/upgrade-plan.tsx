import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Title, SubTitle, NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { convertToFriendlyWebsiteName } from 'calypso/blocks/import/util';
import ConfirmUpgradePlan from './../confirm-upgrade-plan';

interface Props {
	sourceSite: SiteDetails;
	targetSite: SiteDetails;

	startImport: () => void;
	onContentOnlyClick: () => void;
}

export const PreMigrationUpgradePlan: React.FunctionComponent< Props > = ( props: Props ) => {
	const translate = useTranslate();
	const plan = getPlan( PLAN_BUSINESS );
	const { sourceSite, targetSite, startImport, onContentOnlyClick } = props;

	return (
		<>
			<div className="import__heading-title">
				<Title>Upgrade your plan</Title>
				<SubTitle>
					{ translate( 'Migrating themes, plugins, users, and settings requires a %(plan)s plan', {
						args: {
							plan: plan?.getTitle(),
						},
					} ) }
				</SubTitle>
			</div>
			<p>
				{ translate(
					'Your entire site %(from)s will be migrated to %(to)s, overriding the content in your destination site',
					{
						args: {
							from: convertToFriendlyWebsiteName( sourceSite.URL ),
							to: convertToFriendlyWebsiteName( targetSite.URL ),
						},
					}
				) }
			</p>
			<ConfirmUpgradePlan sourceSite={ sourceSite } targetSite={ targetSite } />
			<div className="import__footer-button-container">
				<NextButton onClick={ () => startImport() }>
					{ translate( 'Upgrade and migrate' ) }
				</NextButton>
				<Button
					borderless={ true }
					className="action-buttons__content-only"
					onClick={ onContentOnlyClick }
				>
					{ translate( 'Use the content-only import option' ) }
				</Button>
			</div>
		</>
	);
};
