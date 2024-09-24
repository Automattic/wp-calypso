import { Badge, FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryPlugins from 'calypso/components/data/query-plugins';
import SocialLogo from 'calypso/components/social-logo';
import { FediverseServiceSection } from 'calypso/my-sites/site-settings/fediverse-settings';
import { useActivityPubStatus } from 'calypso/state/activitypub/use-activitypub-status';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function FediverseHeader() {
	const translate = useTranslate();
	return (
		<div>
			<SocialLogo icon="fediverse" size={ 48 } className="sharing-service__logo" />
			<div className="sharing-service__name">
				<h2>
					{ translate( 'Fediverse' ) }
					<Badge className="service__new-badge">{ translate( 'New' ) }</Badge>
				</h2>
				<p className="sharing-service__description">
					{ translate( 'Mastodon today, Threads tomorrow. Enter the Fediverse with ActivityPub.' ) }
				</p>
			</div>
		</div>
	);
}

function JetpackFediverseStatus( { siteId } ) {
	const translate = useTranslate();
	const plugin = useSelector( ( state ) => getPluginOnSite( state, siteId, 'activitypub' ) );
	const pluginIsActive = plugin?.active;
	const pluginIsInstalledAndInactive = plugin && ! pluginIsActive;
	return (
		<>
			<QueryPlugins siteId={ siteId } />
			{ ( ! plugin || pluginIsInstalledAndInactive ) && (
				<Badge type="info">{ translate( 'Inactive' ) }</Badge>
			) }
			{ pluginIsActive && <Badge type="info-blue">{ translate( 'Enabled' ) }</Badge> }
		</>
	);
}

function FediverseStatus() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const isPrivate = site?.is_private || site?.is_coming_soon;
	const { isEnabled, isLoading, isError } = useActivityPubStatus( siteId );
	const disabled = isLoading || isError;

	if ( isPrivate || disabled ) {
		return null;
	}

	if ( isJetpack ) {
		return <JetpackFediverseStatus siteId={ siteId } />;
	}

	return isEnabled ? (
		<Badge type="info-blue">{ translate( 'Enabled' ) }</Badge>
	) : (
		<Badge type="info">{ translate( 'Disabled' ) }</Badge>
	);
}

export default function Fediverse() {
	return (
		<li>
			<FoldableCard
				header={ <FediverseHeader /> }
				className="sharing-service sharing-service--fediverse"
				title="Fediverse"
				summary={ <FediverseStatus /> }
				clickableHeader
				compact
			>
				<FediverseServiceSection needsBorders={ false } />
			</FoldableCard>
		</li>
	);
}
