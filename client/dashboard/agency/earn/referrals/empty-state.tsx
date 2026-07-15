import { tipaltiPayeeQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { reusableBlock, currencyDollar } from '@wordpress/icons';
import OverviewCard from '../../../components/overview-card';
import { Text } from '../../../components/text';
import jetpackLogo from '../../marketplace/exclusive-offers/images/jetpack.svg';
import pressableLogo from '../../marketplace/exclusive-offers/images/pressable.svg';
import wooLogo from '../../marketplace/exclusive-offers/images/woo.svg';
import wordpressLogo from '../../marketplace/exclusive-offers/images/wordpressdotcom.svg';
import { getAccountStatus } from '../payout-settings/get-account-status';

import './style.scss';

const LOGOS = [
	{ src: jetpackLogo, alt: 'Jetpack' },
	{ src: wooLogo, alt: 'WooCommerce' },
	{ src: pressableLogo, alt: 'Pressable' },
	{ src: wordpressLogo, alt: 'WordPress.com' },
];

export default function ReferralsEmptyState( { agencyId }: { agencyId: number } ) {
	const { data: payee } = useQuery( tipaltiPayeeQuery( agencyId ) );
	const accountStatus = getAccountStatus( payee );
	const hasPayeeAccount = !! accountStatus?.status;

	return (
		<VStack spacing={ 8 } className="referrals-empty-state" alignment="center">
			<HStack spacing={ 4 } justify="center" expanded={ false }>
				{ LOGOS.map( ( logo ) => (
					<img key={ logo.alt } src={ logo.src } alt={ logo.alt } width={ 32 } height={ 32 } />
				) ) }
			</HStack>
			<VStack spacing={ 2 } alignment="center">
				<Heading level={ 2 } className="referrals-empty-state__heading">
					{ sprintf(
						/* translators: %s is a commission percentage, e.g. 50% */
						__( 'Recommend our products. Earn up to a %s commission.' ),
						formatNumber( 0.5, { numberFormatOptions: { style: 'percent' } } )
					) }
				</Heading>
				<Text variant="muted" align="center">
					{ __(
						'Make money when your clients buy Automattic products, hosting, or use WooPayments. No promo codes needed.'
					) }
				</Text>
			</VStack>
			<Grid
				className="referrals-empty-state__steps"
				templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
				gap={ 4 }
			>
				<OverviewCard
					icon={ reusableBlock }
					title={ __( 'Refer products and hosting' ) }
					heading={ sprintf(
						/* translators: %s is a commission percentage, e.g. 50% */
						__( 'Receive up to a %s commission.' ),
						formatNumber( 0.5, { numberFormatOptions: { style: 'percent' } } )
					) }
					description={ __( 'Recommend our products to your clients and earn.' ) }
					link="/marketplace/exclusive-offers"
					intent="upsell"
				/>
				<OverviewCard
					icon={ currencyDollar }
					title={ __( 'Prepare to get paid' ) }
					heading={
						hasPayeeAccount ? __( 'Edit your payout details' ) : __( 'Add your payout details' )
					}
					description={ __( 'Set up secure payments through Tipalti.' ) }
					link="/earn/payout-settings"
					bottom={
						accountStatus ? (
							<Badge intent={ accountStatus.statusType }>{ accountStatus.status }</Badge>
						) : undefined
					}
				/>
			</Grid>
		</VStack>
	);
}
