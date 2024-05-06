import { Badge, FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SocialLogo from 'calypso/components/social-logo';
import { FediverseServiceSection } from 'calypso/my-sites/site-settings/fediverse-settings';

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

export default function Fediverse() {
	const header = FediverseHeader();
	return (
		<li>
			<FoldableCard
				header={ header }
				className="sharing-service sharing-service--fediverse"
				title="Fediverse"
			>
				<FediverseServiceSection needsBorders={ false } />
			</FoldableCard>
		</li>
	);
}
