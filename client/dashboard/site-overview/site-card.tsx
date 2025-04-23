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
import SitePreview from '../site-preview';
import type { Site, SiteDomain, Plan } from '../data/types';

/**
 * SiteCard component to display site information in a card format
 */
export default function SiteCard( {
	site,
	phpVersion,
	primaryDomain,
	currentPlan,
}: {
	site: Site;
	phpVersion?: string;
	primaryDomain?: SiteDomain;
	currentPlan: Plan;
} ) {
	const { options, url } = site;
	const { software_version, blog_public } = options;
	return (
		<Card>
			<VStack spacing={ 6 }>
				<div className="dashboard-site-overview__preview-image">
					{ /* If the site is private, show the preview image, because X-Frame-Options is set to same origin. */ }
					{ blog_public === -1 && (
						<div
							style={ {
								width: '300px',
								height: '200px',
								fontSize: '24px',
								background: 'var(--dashboard__background-color)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							} }
						>
							{ __( 'Private Site' ) }
						</div>
					) }
					{ /* If the site is public or coming soon, show the preview iframe. */ }
					{ blog_public > -1 && (
						<div
							className="dashboard-site-overview__preview-iframe"
							style={ { width: '300px', height: '200px' } }
						>
							<SitePreview url={ url } scale={ 0.25 } />
						</div>
					) }
				</div>
				<VStack spacing={ 6 } className="site-card-contents">
					{ primaryDomain && (
						<Field title={ __( 'Domain' ) }>
							<ExternalLink href={ url }>{ primaryDomain.domain }</ExternalLink>
						</Field>
					) }
					<HStack justify="space-between">
						<Field title={ __( 'Status' ) }>status here...</Field>
					</HStack>
					<HStack justify="space-between">
						<Field title={ __( 'WordPress' ) }>{ software_version }</Field>
						{ phpVersion && <Field title={ __( 'PHP' ) }>{ phpVersion }</Field> }
					</HStack>
					<PlanDetails site={ site } currentPlan={ currentPlan } primaryDomain={ primaryDomain } />
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
	return (
		<Text className="site-overview-field-title" variant="muted">
			{ children }
		</Text>
	);
}

function PlanDetails( {
	site,
	currentPlan,
	primaryDomain,
}: {
	site: Site;
	currentPlan: Plan;
	primaryDomain?: SiteDomain;
} ) {
	const {
		plan: { product_name_short, is_free: isFree },
	} = site;
	const { expiry, id } = currentPlan;
	return (
		<VStack>
			<FieldTitle>{ __( 'Plan' ) }</FieldTitle>
			{ product_name_short && <Text>{ product_name_short }</Text> }
			<Text>{ getPlanExpirationMessage( { isFree, expiry } ) }</Text>
			{ primaryDomain && (
				<Button
					href={ `/purchases/subscriptions/${ primaryDomain.domain }/${ id }` }
					variant="link"
				>
					{ __( 'Manage subscription' ) }
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
