import { useLoaderData } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Card,
} from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __, sprintf } from '@wordpress/i18n';
import type { FetchSiteRouteResponse } from '../data/types';

/**
 * SiteCard component to display site information in a card format
 */
export default function SiteCard() {
	const {
		site: { options: { software_version } = {}, url },
		phpVersion,
	} = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
	return (
		<Card>
			<VStack spacing={ 6 }>
				<div className="site-card-preview-image">
					<img
						src={ `https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }?w=350&h=200` }
						alt={ __( 'Site preview' ) }
						style={ { width: '100%', height: 'auto', display: 'block' } }
					/>
				</div>
				<VStack spacing={ 6 } className="site-card-contents">
					<HStack justify="space-between">
						<Field title={ __( 'Status' ) }>status here...</Field>
					</HStack>
					<HStack justify="space-between">
						<Field title={ __( 'WordPress' ) }>{ software_version }</Field>
						{ phpVersion && <Field title={ __( 'PHP' ) }>{ phpVersion }</Field> }
					</HStack>
					<PlanDetails />
				</VStack>
			</VStack>
		</Card>
	);
}

function Field( { children, title }: { children: React.ReactNode; title: React.ReactNode } ) {
	return (
		<VStack className="site-overview-field">
			<FieldTitle>{ title }</FieldTitle>
			<div className="site-overview-field-children">{ children }</div>
		</VStack>
	);
}

// TODO: maybe find a better name for this. It aims to be reused by fields (ex: Plan)
// and cards (ex: Visitors) to have the same styles.
function FieldTitle( { children }: { children: React.ReactNode } ) {
	return <div className="site-overview-field-title">{ children }</div>;
}

function PlanDetails() {
	const {
		site: {
			plan: { product_name_short, is_free: isFree },
		},
		currentPlan: { expiry },
	} = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
	return (
		<VStack>
			<FieldTitle>{ __( 'Plan' ) }</FieldTitle>
			{ product_name_short && <Text>{ product_name_short }</Text> }
			<Text>{ getPlanExpirationMessage( { isFree, expiry } ) }</Text>
		</VStack>
	);
}

function getPlanExpirationMessage( { isFree, expiry }: { isFree: boolean; expiry: string } ) {
	if ( isFree ) {
		return __( 'No expiration date.' );
	}
	return (
		expiry &&
		/* translators: %s: date of plan's expiration date. Eg.  August 20, 2025 */
		sprintf( __( 'Expires on %s.' ), dateI18n( 'F j, Y', expiry ) )
	);
}
