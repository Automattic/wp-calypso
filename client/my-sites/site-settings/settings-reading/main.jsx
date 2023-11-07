import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const SiteSettingsReading = () => {
	return (
		<Main className="settings-performance site-settings site-settings__performance-settings">
			<DocumentHead title="Reading Settings" />
			<FormattedHeader
				brandFont
				className="settings-performance__page-heading"
				headerText="Reading Settings"
				subHeaderText="Explore settings to improve your site's performance. {{learnMoreLink}}Learn more{{/learnMoreLink}}."
				align="left"
			/>
		</Main>
	);
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteIsAtomic = isSiteAutomatedTransfer( state, siteId );
	const siteIsAtomicPrivate = siteIsAtomic && isPrivateSite( state, siteId );
	return {
		site,
		siteIsJetpack,
		siteIsAtomic,
		siteIsAtomicPrivate,
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( wrapSettingsForm( () => ( {} ) )( SiteSettingsReading ) ) );
