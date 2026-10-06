import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import Divider from '../../../components/divider';
import RouterLinkButton from '../../../components/router-link-button';
import { getMarketplaceHostingSectionRoute } from '../paths';
import { CheckList } from './content-sections';
import { getHosts } from './hosts';
import type { HostingSection } from '../paths';
import type { Host } from './hosts';

interface Props {
	/** What the agency owns of each host, shown as a badge on its card. */
	owned: Partial< Record< HostingSection, string > >;
	isReferralMode: boolean;
	/** The agency owns the largest Pressable plan, so there is nothing to upgrade to. */
	isOnTopPressablePlan?: boolean;
	onPick: ( host: HostingSection ) => void;
}

function getActionLabel( host: Host, leadsToMore: boolean ) {
	if ( host.key === 'vip' ) {
		return __( 'Explore VIP' );
	}
	if ( leadsToMore ) {
		return host.key === 'wpcom' ? __( 'Add more sites' ) : __( 'Upgrade plan' );
	}
	return sprintf(
		/* translators: %s is the name of a hosting provider, e.g. Pressable. */
		__( 'Explore %s' ),
		host.name
	);
}

/**
 * The hosts side by side, each led by who it is for rather than a price:
 * WordPress.com is priced per site and Pressable per shared plan, so prices
 * wait for each host's own page.
 */
export default function HostCards( {
	owned,
	isReferralMode,
	isOnTopPressablePlan = false,
	onPick,
}: Props ) {
	// Every brand block keeps room for a badge once one card has it, so the rows line up.
	const hasBadge = Object.values( owned ).some( Boolean );

	return (
		<div className="dashboard-marketplace-hosting__hosts">
			{ getHosts().map( ( host ) => {
				const ownedLabel = owned[ host.key ];
				// Referrals are for a client, so what the agency owns doesn't change the action.
				const leadsToMore =
					!! ownedLabel &&
					! isReferralMode &&
					! ( host.key === 'pressable' && isOnTopPressablePlan );
				return (
					<Card key={ host.key }>
						<CardBody>
							<VStack spacing={ 4 }>
								<VStack
									spacing={ 2 }
									alignment="flex-start"
									justify="flex-start"
									className={ clsx( 'dashboard-marketplace-hosting__host-brand', {
										'has-badge': hasBadge,
									} ) }
								>
									<Text variant="muted">{ host.tier }</Text>
									<img
										src={ host.logo }
										alt={ host.name }
										className="dashboard-marketplace-hosting__host-logo"
									/>
									{ ownedLabel && <Badge intent="stable">{ ownedLabel }</Badge> }
								</VStack>
								<Text
									size={ 15 }
									lineHeight="22px"
									className="dashboard-marketplace-hosting__host-lead"
								>
									{ host.bestFor }
								</Text>
								<VStack
									className={ `dashboard-marketplace-hosting__host-art is-${ host.key }` }
									aria-hidden="true"
								>
									<img src={ host.art } alt="" />
								</VStack>
								{ /* The column stretches the button; the inner stack centres its label. */ }
								<VStack>
									<RouterLinkButton
										variant="primary"
										__next40pxDefaultSize
										to={ getMarketplaceHostingSectionRoute( host.key ) }
										onClick={ () => onPick( host.key ) }
									>
										<HStack justify="center">{ getActionLabel( host, leadsToMore ) }</HStack>
									</RouterLinkButton>
								</VStack>
								<Divider style={ { color: 'var(--dashboard-overview__divider-color)' } } />
								<VStack spacing={ 3 }>
									<Text weight={ 500 }>{ __( 'What’s included' ) }</Text>
									<CheckList items={ host.includes } />
								</VStack>
							</VStack>
						</CardBody>
					</Card>
				);
			} ) }
		</div>
	);
}
