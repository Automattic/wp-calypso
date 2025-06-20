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
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { TextBlur } from '../../components/text-blur';
import { hasAtomicFeature } from '../../utils/site-features';
import { getSiteStatusLabel } from '../../utils/site-status';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import { HostingFeatures } from '../features';
import { PHPVersion } from '../site-fields';
import SitePreview from '../site-preview';
import type { Site } from '../../data/types';
/**
 * SiteCard component to display site information in a card format
 */
export default function SiteCard( { site }: { site: Site } ) {
	const { URL: url, is_private } = site;
	const wpVersion = getFormattedWordPressVersion( site );
	const hasPHPFeature = hasAtomicFeature( site, HostingFeatures.PHP );

	// If the site is a private A8C site, X-Frame-Options is set to same
	// origin.
	const iframeDisabled = site.is_a8c && is_private;
	return (
		<Card>
			<VStack spacing={ 6 }>
				<div className="dashboard-site-overview__preview-image">
					{ iframeDisabled && (
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
							{ __( 'A8C Private Site' ) }
						</div>
					) }
					{ ! iframeDisabled && (
						<div
							className="dashboard-site-overview__preview-iframe"
							style={ { width: '300px', height: '200px' } }
						>
							<SitePreview url={ url } scale={ 0.25 } />
						</div>
					) }
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
					{ ( wpVersion || hasPHPFeature ) && (
						<HStack justify="space-between">
							{ wpVersion && <Field title={ __( 'WordPress' ) }>{ wpVersion }</Field> }
							{ hasPHPFeature && (
								<Field title={ __( 'PHP' ) }>
									<PHPVersion site={ site } />
								</Field>
							) }
						</HStack>
					) }
					<PlanDetails site={ site } />
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

function PlanDetails( { site }: { site: Site } ) {
	const { data: currentPlan } = useQuery( siteCurrentPlanQuery( site.ID ) );

	if ( ! site.plan ) {
		return null;
	}

	const {
		plan: { product_name_short, is_free: isFree },
	} = site;

	return (
		<VStack>
			<FieldTitle>{ __( 'Plan' ) }</FieldTitle>
			{ product_name_short && <Text>{ product_name_short }</Text> }
			{ isFree ? (
				<>
					<Text>{ __( 'No expiration date.' ) }</Text>
					<Button href={ `/plans/${ site.slug }` } variant="link">
						{ __( 'Upgrade' ) }
					</Button>
				</>
			) : (
				<>
					{ currentPlan ? (
						<>
							<Text>{ getPlanExpirationMessage( currentPlan.expiry ) }</Text>
							<Button
								href={ `/purchases/subscriptions/${ site.slug }/${ currentPlan.id }` }
								variant="link"
							>
								{ __( 'Manage subscription' ) }
							</Button>
						</>
					) : (
						<>
							<Text>
								<TextBlur>{ getPlanExpirationMessage( new Date().toISOString() ) }</TextBlur>
							</Text>
							{ /* @ts-expect-error inert is not typed */ }
							<Button inert href="" variant="link">
								<TextBlur>{ __( 'Manage subscription' ) }</TextBlur>
							</Button>
						</>
					) }
				</>
			) }
		</VStack>
	);
}

function getPlanExpirationMessage( isoDate?: string ) {
	if ( ! isoDate ) {
		return null;
	}

	return createInterpolateElement(
		/* translators: %s: date of plan's expiration date. Eg.  August 20, 2025 */
		sprintf( __( 'Expires on <time>%s</time>.' ), dateI18n( 'F j, Y', isoDate ) ),
		{
			time: <time dateTime={ isoDate } />,
		}
	);
}
