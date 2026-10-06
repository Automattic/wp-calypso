import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Card, CardBody } from '../../../components/card';
import RouterLinkButton from '../../../components/router-link-button';
import { getMarketplaceHostingSectionRoute } from '../paths';
import { CheckList } from './content-sections';
import { getHosts } from './hosts';
import type { HostingSection } from '../paths';
import type { Host } from './hosts';

interface Props {
	/** What the agency owns of each host, as the badge on its card. */
	owned: Partial< Record< HostingSection, string > >;
	/** Owners go straight to more sites or a bigger plan; referrals never count what is owned. */
	isReferralMode: boolean;
	onPick: ( host: HostingSection ) => void;
}

// The cards lead with each host's job, not a price: side by side, one price
// anchors the other, and WordPress.com (per site) and Pressable (one shared
// plan) aren't the same unit. Each host's page shows its pricing.
function getActionLabel( host: Host, isOwned: boolean ) {
	if ( isOwned && host.key !== 'vip' ) {
		return host.key === 'wpcom' ? __( 'Add more sites' ) : __( 'Upgrade plan' );
	}
	if ( host.key === 'vip' ) {
		return __( 'Explore VIP' );
	}
	return sprintf(
		/* translators: %s is the name of a hosting provider, e.g. Pressable. */
		__( 'Explore %s' ),
		host.name
	);
}

/**
 * The three hosts side by side. Every card has the same rows in the same
 * order (tier and host, who it is for, the host at its job, action, what's
 * included), so each row reads across all three.
 */
export default function HostCards( { owned, isReferralMode, onPick }: Props ) {
	return (
		<div className="dashboard-marketplace-hosting__hosts">
			{ getHosts().map( ( host ) => {
				const ownedLabel = owned[ host.key ];
				const leadsToMore = !! ownedLabel && ! isReferralMode;
				return (
					<Card key={ host.key } className="dashboard-marketplace-hosting__host">
						<CardBody className="dashboard-marketplace-hosting__host-body">
							<div className="dashboard-marketplace-hosting__host-rows">
								<VStack spacing={ 2 }>
									<Text variant="muted" size={ 13 }>
										{ host.tier }
									</Text>
									<img
										src={ host.logo }
										alt={ host.name }
										className="dashboard-marketplace-hosting__host-logo"
									/>
									{ ownedLabel && (
										<Badge intent="stable" className="dashboard-marketplace-hosting__host-badge">
											{ ownedLabel }
										</Badge>
									) }
								</VStack>
								<Text
									className="dashboard-marketplace-hosting__host-title"
									size={ 15 }
									lineHeight="22px"
								>
									{ host.bestFor }
								</Text>
								<div
									className={ `dashboard-marketplace-hosting__host-window is-${ host.key }` }
									aria-hidden="true"
								>
									<div className="dashboard-marketplace-hosting__host-crop">
										<img src={ host.art } alt="" />
									</div>
								</div>
								<RouterLinkButton
									variant="primary"
									__next40pxDefaultSize
									className="dashboard-marketplace-hosting__host-action"
									to={ getMarketplaceHostingSectionRoute( host.key ) }
									onClick={ () => onPick( host.key ) }
								>
									{ getActionLabel( host, leadsToMore ) }
								</RouterLinkButton>
								<VStack spacing={ 3 } className="dashboard-marketplace-hosting__host-includes">
									<Text weight={ 500 }>{ __( 'What’s included' ) }</Text>
									<CheckList items={ host.includes } />
								</VStack>
							</div>
						</CardBody>
					</Card>
				);
			} ) }
		</div>
	);
}
