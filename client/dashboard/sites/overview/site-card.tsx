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
import { sitePHPVersionQuery, siteCurrentPlanQuery } from '../../app/queries';
import { TextBlur } from '../../components/text-blur';
import { getSiteStatusLabel } from '../../utils/site-status';
import { getFormattedWordPressVersion } from '../../utils/wp-version';
import SitePreview from '../site-preview';
import type { Site } from '../../data/types';

function PHPVersion( { siteSlug }: { siteSlug: string } ) {
	return useQuery( sitePHPVersionQuery( siteSlug ) ).data ?? <TextBlur>X.Y</TextBlur>;
}

/**
 * SiteCard component to display site information in a card format
 */
export default function SiteCard( { site }: { site: Site } ) {
	const { URL: url, is_private, is_wpcom_atomic } = site;
	const wpVersion = getFormattedWordPressVersion( site );

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
	const { data: currentPlan } = useQuery( siteCurrentPlanQuery( site.slug ) );

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
