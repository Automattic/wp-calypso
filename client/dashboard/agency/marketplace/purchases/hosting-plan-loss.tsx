import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { formatNumberCompact } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import { a4aLink } from '../../../utils/link';
import { getPressablePlanInfo } from '../hosting/lib/pressable-plans';
import { matchesProduct } from '../hosting/lib/pressable-products';
import { isPressableLicense } from './license-status';
import type { JetpackLicense } from '@automattic/api-core';

function usePressablePlanFeatures( license: JetpackLicense ): string[] {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: products, isPending } = useQuery( agencyProductsQuery( agency?.id ?? 0 ) );
	const product = products?.find( ( item ) => matchesProduct( license, item ) );
	const plan = product ? getPressablePlanInfo( product ) : undefined;

	// Otherwise the custom-plan list flashes before the real plan loads.
	if ( isPending ) {
		return [];
	}

	if ( ! plan ) {
		return [
			__( 'Custom WordPress installs' ),
			__( 'Custom visits per month' ),
			__( 'Custom storage per month' ),
			__( 'Unmetered bandwidth' ),
		];
	}

	return [
		sprintf(
			// translators: %d is the number of WordPress installs.
			_n( '%d WordPress install', '%d WordPress installs', plan.install ),
			plan.install
		),
		// Classic gives each install its own staging site.
		sprintf(
			// translators: %d is the number of staging sites.
			_n( '%d staging site', '%d staging sites', plan.install ),
			plan.install
		),
		sprintf(
			// translators: %s is the number of visits, e.g. "50K".
			__( '%s visits per month' ),
			formatNumberCompact( plan.visits )
		),
		sprintf(
			// translators: %d is the size of storage in GB.
			__( '%dGB of storage' ),
			plan.storage
		),
		__( 'Unmetered bandwidth' ),
	];
}

function FeatureList( { features }: { features: string[] } ) {
	return (
		<HStack role="list" wrap spacing={ 4 } justify="flex-start">
			{ features.map( ( feature ) => (
				<HStack key={ feature } role="listitem" spacing={ 1 } expanded={ false }>
					<Icon icon={ close } size={ 16 } />
					<Text>{ feature }</Text>
				</HStack>
			) ) }
		</HStack>
	);
}

function PressablePlanLoss( { license }: { license: JetpackLicense } ) {
	return <FeatureList features={ usePressablePlanFeatures( license ) } />;
}

function WpcomPlanLoss() {
	return (
		<FeatureList
			features={ [
				__( '50GB of storage' ),
				__( 'Free staging site' ),
				__( 'Unrestricted bandwidth' ),
			] }
		/>
	);
}

// Only rendered for hosting licenses: Pressable plans and WordPress.com hosting.
export default function HostingPlanLoss( { license }: { license: JetpackLicense } ) {
	const isPressable = isPressableLicense( license );

	return (
		<VStack spacing={ 2 }>
			<Text weight={ 500 }>{ __( "When you cancel you'll immediately lose access to" ) }</Text>
			{ isPressable ? <PressablePlanLoss license={ license } /> : <WpcomPlanLoss /> }
			<ExternalLink
				href={ a4aLink(
					isPressable ? '/marketplace/hosting/pressable' : '/marketplace/hosting/wpcom'
				) }
			>
				{ __( 'And more' ) }
			</ExternalLink>
		</VStack>
	);
}
