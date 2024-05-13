import { Badge, FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SocialLogo from 'calypso/components/social-logo';
import { FediverseServiceSection } from 'calypso/my-sites/site-settings/fediverse-settings';
import { useActivityPubStatus } from 'calypso/state/activitypub/use-activitypub-status';
import { getSite } from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function FediverseHeader() {
	const translate = useTranslate();
	return (
		<div>
			<SocialLogo icon="fediverse" size={ 48 } className="sharing-service__logo" />
			<div class="sharing-service__name">
				<h2>
					{ translate( 'Fediverse' ) }
					<Badge className="service__new-badge">{ translate( 'New' ) }</Badge>
				</h2>
				<p class="sharing-service__description">
					{ translate( 'Mastodon today, Threads tomorrow. Enter the Fediverse with ActivityPub.' ) }
				</p>
			</div>
		</div>
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

	if ( isJetpack || isPrivate || disabled ) {
		return null;
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
				clickableHeader={ true }
			>
				<FediverseServiceSection needsBorders={ false } />
			</FoldableCard>
		</li>
	);
}
