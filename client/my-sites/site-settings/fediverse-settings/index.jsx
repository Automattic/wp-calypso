import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JetpackFediverseSettingsSection } from './JetpackFediverseSettingsSection';
import { WpcomFediverseSettingsSection } from './WpcomFediverseSettingsSection';

export const FediverseServiceSection = ( { needsBorders = true } ) => {
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	return (
		<>
			{ isJetpack ? (
				<JetpackFediverseSettingsSection siteId={ siteId } needsBorders={ needsBorders } />
			) : (
				<WpcomFediverseSettingsSection siteId={ siteId } needsBorders={ needsBorders } />
			) }
		</>
	);
};

export const FediverseSettingsSection = () => {
	const translate = useTranslate();

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Fediverse settings' ) } />
			<FediverseServiceSection />
		</>
	);
};

export const FediverseDeprecatedDiscussionSection = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Fediverse settings' ) } />
			<Card className="site-settings__card">
				<p>
					{ translate( 'Fediverse settings now live in {{link}}Marketing Connections{{/link}}.', {
						components: {
							link: <a href={ `/marketing/connections/${ domain }` } />,
						},
					} ) }
				</p>
			</Card>
		</>
	);
};
