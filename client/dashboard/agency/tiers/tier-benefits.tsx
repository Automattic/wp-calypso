import {
	Button,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Fragment } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../components/card';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { ALL_TIERS, getReportAllowance } from './constants';
import getCurrentAgencyTier from './get-current-agency-tier';
import type {
	AgencyTierType,
	Benefit,
	ProspectReportsBenefitData,
	RecordTracksEvent,
	TierBenefitLinks,
} from './types';
import type { Button as ButtonComponent } from '@wordpress/components';
import type { ComponentProps, ReactNode } from 'react';

/**
 * "3 of 5 reports used this month" once the agency has used some, otherwise
 * the allowance ("5 reports a month"). Falls back to the tier's allowance
 * while usage loads. Nothing while the account awaits approval.
 */
export function getProspectReportsUsageText(
	{ usage }: ProspectReportsBenefitData = {},
	tierId?: AgencyTierType
) {
	if ( usage?.limit === null ) {
		return __( 'Unlimited reports every month' );
	}
	if ( usage && usage.limit <= 0 ) {
		return null;
	}
	if ( usage && usage.used > 0 ) {
		return sprintf(
			/* translators: 1: reports created this month, 2: monthly allowance */
			_n(
				'%1$d of %2$d report used this month',
				'%1$d of %2$d reports used this month',
				usage.limit
			),
			usage.used,
			usage.limit
		);
	}
	const limit = usage?.limit ?? ( tierId ? getReportAllowance( tierId ) : 0 );
	if ( ! limit ) {
		return null;
	}
	return sprintf(
		/* translators: %d is the monthly report allowance */
		_n( '%d report a month', '%d reports a month', limit ),
		limit
	);
}

function BenefitRow( {
	benefit,
	isLocked,
	isSmallViewport,
	recordTracksEvent,
	onScheduleCall,
	isSchedulingCall,
	onContactSupport,
	currentAgencyTierId,
	links,
	shouldUseRouterLink,
	renderDownloadBadges,
	prospectReports,
}: {
	benefit: Benefit;
	isLocked: boolean;
	isSmallViewport: boolean;
	recordTracksEvent: RecordTracksEvent;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	onContactSupport?: () => void;
	currentAgencyTierId?: AgencyTierType;
	links: TierBenefitLinks;
	shouldUseRouterLink: boolean;
	renderDownloadBadges?: ( buttonProps: ComponentProps< typeof ButtonComponent > ) => ReactNode;
	prospectReports?: ProspectReportsBenefitData;
} ) {
	const usageText =
		benefit.id === 'prospect-reports' && ! isLocked
			? getProspectReportsUsageText( prospectReports, currentAgencyTierId )
			: null;

	const renderActions = () => {
		// Locked (higher) tiers don't expose actions yet.
		if ( isLocked || ! benefit.actions ) {
			return null;
		}

		const buttonProps = {
			size: ( isSmallViewport ? 'default' : 'small' ) as ComponentProps<
				typeof ButtonComponent
			>[ 'size' ],
			variant: ( isSmallViewport ? 'secondary' : 'tertiary' ) as ComponentProps<
				typeof ButtonComponent
			>[ 'variant' ],
			style: isSmallViewport ? { justifyContent: 'center' } : undefined,
		};

		const buttons = benefit.actions.map( ( action ) => {
			if ( action.id === 'download-badge' ) {
				return renderDownloadBadges ? (
					<Fragment key={ action.id }>{ renderDownloadBadges( buttonProps ) }</Fragment>
				) : null;
			}
			if ( action.id === 'schedule-call' ) {
				return (
					<Button
						{ ...buttonProps }
						key={ action.id }
						onClick={ onScheduleCall }
						isBusy={ isSchedulingCall }
						disabled={ isSchedulingCall }
					>
						{ action.label }
					</Button>
				);
			}
			const onClick = () =>
				recordTracksEvent( 'calypso_a4a_agency_tier_benefits_action_click', {
					agency_tier: currentAgencyTierId,
					action_id: action.id,
				} );
			if ( action.id === 'contact-support' && onContactSupport ) {
				return (
					<Button
						{ ...buttonProps }
						key={ action.id }
						onClick={ () => {
							onClick();
							onContactSupport();
						} }
					>
						{ action.label }
					</Button>
				);
			}
			const href = links[ action.id ];
			if ( ! href ) {
				return null;
			}
			// Only in-app paths go through the router; absolute URLs and hash
			// links stay plain anchors.
			if ( shouldUseRouterLink && href.startsWith( '/' ) ) {
				const [ to, query ] = href.split( '?' );
				return (
					<RouterLinkButton
						{ ...buttonProps }
						key={ action.id }
						to={ to }
						search={ query ? Object.fromEntries( new URLSearchParams( query ) ) : undefined }
						onClick={ onClick }
					>
						{ action.label }
					</RouterLinkButton>
				);
			}
			return (
				<Button { ...buttonProps } key={ action.id } href={ href } onClick={ onClick }>
					{ action.label }
				</Button>
			);
		} );

		if ( isSmallViewport ) {
			return (
				<VStack spacing={ 2 } style={ { paddingBlockStart: '8px', width: '100%' } }>
					{ buttons }
				</VStack>
			);
		}
		return (
			<HStack spacing={ 2 } justify="flex-start" style={ { paddingBlockStart: '8px' } }>
				{ buttons }
			</HStack>
		);
	};

	return (
		<HStack spacing={ 4 } alignment="flex-start" justify="flex-start">
			{ ! isSmallViewport && (
				<div
					aria-hidden="true"
					style={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						width: '48px',
						height: '48px',
						borderRadius: '4px',
						background: 'var(--color-gray-100)',
						color: 'var(--color-gray-700)',
						opacity: isLocked ? 0.5 : undefined,
					} }
				>
					<Icon icon={ benefit.icon } size={ 28 } />
				</div>
			) }
			<VStack spacing={ 2 } style={ { flexGrow: 1 } }>
				<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
					<Text weight={ 500 } variant={ isLocked ? 'muted' : undefined }>
						{ benefit.title }
					</Text>
					{ benefit.status && <Badge intent="draft" children={ benefit.status } /> }
				</HStack>
				<Text size={ 12 } variant="muted" style={ { textWrap: 'pretty' } }>
					{ benefit.description }
				</Text>
				{ usageText && (
					<Text size={ 12 } weight={ 500 }>
						{ usageText }
					</Text>
				) }
				{ renderActions() }
			</VStack>
		</HStack>
	);
}

export default function TierBenefits( {
	currentAgencyTierId,
	recordTracksEvent = () => {},
	onScheduleCall,
	isSchedulingCall,
	onContactSupport,
	links = {},
	shouldUseRouterLink = true,
	renderDownloadBadges,
	prospectReports,
}: {
	currentAgencyTierId?: AgencyTierType;
	recordTracksEvent?: RecordTracksEvent;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	/** Opens contact support in-app; without it, the `contact-support` link is used. */
	onContactSupport?: () => void;
	links?: TierBenefitLinks;
	/**
	 * Set to false in apps without the dashboard's TanStack Router, so the
	 * buttons render plain anchors for the host app's own router to pick up.
	 */
	shouldUseRouterLink?: boolean;
	renderDownloadBadges?: ( buttonProps: ComponentProps< typeof ButtonComponent > ) => ReactNode;
	/** Usage for the Prospect Reports row. */
	prospectReports?: ProspectReportsBenefitData;
} ) {
	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'large', '<' );
	const isMediumViewport = useViewportMatch( 'huge', '<' );

	if ( ! currentTier ) {
		return null;
	}

	// Rearrange tiers: current first, then lower tiers, then higher tiers.
	const lowerTiers = ALL_TIERS.filter( ( tier ) => tier.level < currentTier.level ).sort(
		( a, b ) => b.level - a.level
	);
	const higherTiers = ALL_TIERS.filter( ( tier ) => tier.level > currentTier.level ).sort(
		( a, b ) => a.level - b.level
	);
	const allTiersToShow = [ currentTier, ...lowerTiers, ...higherTiers ];

	return (
		<VStack spacing={ 6 } style={ { alignItems: 'center' } }>
			{ allTiersToShow.map( ( tier ) => {
				const isCurrentTier = tier.id === currentAgencyTierId;
				const isLowerTier = tier.level < currentTier.level;
				const isHigherTier = tier.level > currentTier.level;
				const benefits = tier.benefits.filter(
					( benefit ) =>
						( ! benefit.requiresLink || links[ benefit.requiresLink ] ) &&
						( ! benefit.isUpgradeOnly || isHigherTier )
				);

				let tierHeading: string;
				if ( tier.id === 'emerging-partner' ) {
					tierHeading = __( 'Your essential benefits' );
				} else if ( isCurrentTier || isLowerTier ) {
					tierHeading = sprintf(
						/* translators: %s is the agency tier name */
						__( 'Your %s benefits' ),
						tier.name
					);
				} else {
					tierHeading = sprintf(
						/* translators: %s is the agency tier name */
						__( 'What you’ll unlock when you become a %s' ),
						tier.name
					);
				}

				return (
					<Card
						id={ tier.id }
						key={ tier.id }
						style={ {
							width: isMediumViewport ? '100%' : '50%',
							minWidth: isMediumViewport ? 'unset' : '600px',
						} }
					>
						<CardHeader isBorderless>
							<SectionHeader title={ tierHeading } level={ 3 } />
						</CardHeader>
						{ benefits.map( ( benefit, index ) => (
							<Fragment key={ benefit.title }>
								{ index > 0 && <CardDivider style={ { borderColor: 'var(--color-gray-100)' } } /> }
								<CardBody>
									<BenefitRow
										benefit={ benefit }
										isLocked={ isHigherTier }
										isSmallViewport={ isSmallViewport }
										recordTracksEvent={ recordTracksEvent }
										onScheduleCall={ onScheduleCall }
										isSchedulingCall={ isSchedulingCall }
										onContactSupport={ onContactSupport }
										currentAgencyTierId={ currentAgencyTierId }
										links={ links }
										shouldUseRouterLink={ shouldUseRouterLink }
										renderDownloadBadges={ renderDownloadBadges }
										prospectReports={ prospectReports }
									/>
								</CardBody>
							</Fragment>
						) ) }
					</Card>
				);
			} ) }
		</VStack>
	);
}
