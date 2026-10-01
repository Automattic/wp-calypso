import { formatCurrency } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Card, CardBody } from '../../../components/card';
import RouterLinkButton from '../../../components/router-link-button';
import { getMarketplaceHostingSectionRoute } from '../paths';
import { CheckList } from './content-sections';
import { getHosts } from './hosts';
import type { HostingSection } from '../paths';
import type { TermPricing } from '../use-term-pricing';
import type { Host } from './hosts';

/** Where a host's price starts. */
export interface HostPrice {
	amount: number;
	currency: string;
}

interface Props {
	term: TermPricing;
	/** Where each self-serve host's price starts; a host without one shows nothing yet. */
	prices: Partial< Record< 'wpcom' | 'pressable', HostPrice > >;
	/** What the agency owns of each host, as the badge on its card. */
	owned: Partial< Record< HostingSection, string > >;
	/** Owners go straight to more sites or a bigger plan; referrals never count what is owned. */
	isReferralMode: boolean;
	onPick: ( host: HostingSection ) => void;
}

function getPriceUnit( host: HostingSection, term: TermPricing ) {
	if ( host === 'wpcom' ) {
		return term === 'yearly'
			? __( 'per site, per year, with volume discounts' )
			: __( 'per site, per month, with volume discounts' );
	}
	if ( host === 'pressable' ) {
		return term === 'yearly'
			? __( 'per year, one plan shared across your sites' )
			: __( 'per month, one plan shared across your sites' );
	}
	return __( 'Guided onboarding and dedicated support' );
}

// VIP has no list price; a host whose price is still loading keeps its row's height.
function getFigure( host: HostingSection, price: HostPrice | undefined ) {
	if ( host === 'vip' ) {
		return __( 'Custom' );
	}
	return price ? formatCurrency( price.amount, price.currency, { stripZeros: true } ) : '\u00a0';
}

// The next screen is where the purchase is set up, so the buttons say
// "Configure": picking a host isn't buying it yet. VIP is sold by a demo or a
// referral, so its card leads to what it offers.
function getActionLabel( host: Host, isOwned: boolean ) {
	if ( host.key === 'vip' ) {
		return __( 'Learn more' );
	}
	if ( isOwned ) {
		return host.key === 'wpcom' ? __( 'Add more sites' ) : __( 'Upgrade plan' );
	}
	return sprintf(
		/* translators: %s is the name of a hosting provider, e.g. Pressable. */
		__( 'Configure %s' ),
		host.name
	);
}

/**
 * The three hosts side by side. Every card has the same rows in the same
 * order (host, who it is for, price, action, what's included), so each row
 * reads across all three.
 */
export default function HostCards( { term, prices, owned, isReferralMode, onPick }: Props ) {
	return (
		<div className="dashboard-marketplace-hosting__hosts">
			{ getHosts().map( ( host ) => {
				const ownedLabel = owned[ host.key ];
				const leadsToMore = !! ownedLabel && ! isReferralMode;
				const price = host.key === 'vip' ? undefined : prices[ host.key ];
				return (
					<Card key={ host.key } className="dashboard-marketplace-hosting__host">
						<CardBody>
							<div className="dashboard-marketplace-hosting__host-rows">
								<HStack justify="space-between" alignment="center" wrap>
									<img
										src={ host.logo }
										alt={ host.name }
										className="dashboard-marketplace-hosting__host-logo"
									/>
									{ ownedLabel && <Badge intent="stable">{ ownedLabel }</Badge> }
								</HStack>
								<VStack spacing={ 1 }>
									<Text className="dashboard-marketplace-hosting__host-title">
										{ host.bestFor }
									</Text>
									<Text variant="muted">{ host.tier }</Text>
								</VStack>
								<VStack spacing={ 1 }>
									<Text variant="muted" size={ 12 }>
										{ host.key === 'vip' ? '\u00a0' : __( 'Starting at' ) }
									</Text>
									<Text className="dashboard-marketplace-hosting__host-figure">
										{ getFigure( host.key, price ) }
									</Text>
									<Text variant="muted">{ getPriceUnit( host.key, term ) }</Text>
								</VStack>
								<RouterLinkButton
									variant={ host.key === 'vip' ? 'secondary' : 'primary' }
									__next40pxDefaultSize
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
