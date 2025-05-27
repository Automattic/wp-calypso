import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	Card,
	ExternalLink,
} from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __, sprintf } from '@wordpress/i18n';
import { sitePHPVersionQuery } from '../../app/queries';
import { TextBlur } from '../../components/text-blur';
import { getSiteStatusLabel } from '../../utils/site-status';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import SitePreview from '../site-preview';
import type { Site, Plan } from '../../data/types';

function PHPVersion( { siteSlug }: { siteSlug: string } ) {
	return useQuery( sitePHPVersionQuery( siteSlug ) ).data ?? <TextBlur text="X.Y" />;
}

/**
 * SiteCard component to display site information in a card format
 */
export default function SiteCard( { site, currentPlan }: { site: Site; currentPlan: Plan } ) {
	const { URL: url, is_wpcom_atomic } = site;
	const wpVersion = getFormattedWordPressVersion( site );

	return (
		<Card>
			<VStack spacing={ 6 }>
				<div className="dashboard-site-overview__preview-image">
					<SitePreview width={ 300 } site={ site } />
				</div>
				<VStack spacing={ 6 } className="site-card-contents">
					<Field title={ __( 'Domain' ) }>
						<ExternalLink href={ url } style={ { overflowWrap: 'anywhere' } }>
							{ new URL( url ).hostname }
						</ExternalLink>
					</Field>
					<HStack justify="space-between">
						<Field title={ __( 'Status' ) }>{ getSiteStatusLabel( site ) }</Field>
					</HStack>
					{ ( wpVersion || is_wpcom_atomic ) && (
						<HStack justify="space-between">
							{ wpVersion && <Field title={ __( 'WordPress' ) }>{ wpVersion }</Field> }
							{ is_wpcom_atomic && (
								<Field title={ __( 'PHP' ) }>
									<PHPVersion siteSlug={ site.slug } />
								</Field>
							) }
						</HStack>
					) }
					<PlanDetails site={ site } currentPlan={ currentPlan } />
				</VStack>
			</VStack>
		</Card>
	);
}

function Field( { children, title }: { children: React.ReactNode; title: React.ReactNode } ) {
	return (
		<VStack className="site-overview-field" style={ { flex: 1 } }>
			<FieldTitle>{ title }</FieldTitle>
			<div className="site-overview-field-children">{ children }</div>
		</VStack>
	);
}

// TODO: maybe find a better name for this. It aims to be reused by fields (ex: Plan)
// and cards (ex: Visitors) to have the same styles.
function FieldTitle( { children }: { children: React.ReactNode } ) {
	return (
		<Text className="site-overview-field-title" variant="muted">
			{ children }
		</Text>
	);
}

function PlanDetails( { site, currentPlan }: { site: Site; currentPlan: Plan } ) {
	if ( ! site.plan || ! currentPlan ) {
		return null;
	}

	const {
		plan: { product_name_short, is_free: isFree },
	} = site;
	const { expiry, id } = currentPlan;
	return (
		<VStack>
			<FieldTitle>{ __( 'Plan' ) }</FieldTitle>
			{ product_name_short && <Text>{ product_name_short }</Text> }
			<Text>{ getPlanExpirationMessage( { isFree, expiry } ) }</Text>
			{ id ? (
				<Button href={ `/purchases/subscriptions/${ site.slug }/${ id }` } variant="link">
					{ __( 'Manage subscription' ) }
				</Button>
			) : (
				<Button href={ `/plans/${ site.slug }` } variant="link">
					{ __( 'Upgrade' ) }
				</Button>
			) }
		</VStack>
	);
}

function getPlanExpirationMessage( { isFree, expiry }: { isFree: boolean; expiry?: string } ) {
	if ( isFree ) {
		return __( 'No expiration date.' );
	}
	return (
		expiry &&
		/* translators: %s: date of plan's expiration date. Eg.  August 20, 2025 */
		sprintf( __( 'Expires on %s.' ), dateI18n( 'F j, Y', expiry ) )
	);
}
