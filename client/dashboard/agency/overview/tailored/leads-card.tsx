/**
 * PROTOTYPE — proof of concept only.
 *
 * Client leads card for the tailored Overview, alongside the Referral and
 * WooPayments cards.
 * - Pro tier and above: open lead value plus simple status rows (New, In
 *   progress, Closed), matching the Referral and WooPayments cards, with a
 *   link to the lead dashboard (to be built).
 * - Below Pro: an empty state that explains how leads unlock through the tier
 *   ladder, shows the IAR gap, and suggests the IAR methods that fit this
 *   agency best.
 */
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import {
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { Text } from '../../../components/text';
import OverviewLinkButton from '../overview-link-button';
import StatList from '../stat-list';
import { LEAD_UNLOCKS, getIarMethods, getSampleLeads } from './leads';
import type { IarMethodLinks, LeadStatus } from './leads';
import type { SignupProfile } from './signup-profile';

const money = ( value: number ) => formatCurrency( value, 'USD', { stripZeros: true } );

const getStatusLabels = (): Record< LeadStatus, string > => ( {
	new: __( 'New' ),
	'in-progress': __( 'In progress' ),
	closed: __( 'Closed' ),
} );

function LeadsSummary( {
	leadsHref,
	shouldUseRouterLink,
}: {
	leadsHref: string;
	shouldUseRouterLink?: boolean;
} ) {
	const leads = getSampleLeads();
	const labels = getStatusLabels();
	const countOf = ( status: LeadStatus ) =>
		leads.filter( ( lead ) => lead.status === status ).length;
	const openValue = leads
		.filter( ( lead ) => lead.status !== 'closed' )
		.reduce( ( total, lead ) => total + lead.value, 0 );
	const closedValue = leads
		.filter( ( lead ) => lead.status === 'closed' )
		.reduce( ( total, lead ) => total + lead.value, 0 );

	return (
		<VStack spacing={ 4 }>
			<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
				{ __( 'Client leads' ) }
			</Heading>
			<HStack spacing={ 2 } justify="flex-start" alignment="baseline" expanded={ false }>
				<Text size={ 20 } weight={ 500 } lineHeight="24px">
					{ money( openValue ) }
				</Text>
				<Text intent="success" size={ 12 } lineHeight="16px">
					{ __( 'in open leads' ) }
				</Text>
			</HStack>
			<StatList
				stats={ [
					{ label: labels.new, value: formatNumber( countOf( 'new' ) ) },
					{ label: labels[ 'in-progress' ], value: formatNumber( countOf( 'in-progress' ) ) },
					{
						label: sprintf(
							/* translators: %s is the total value of closed leads */
							__( 'Closed (%s)' ),
							money( closedValue )
						),
						value: formatNumber( countOf( 'closed' ) ),
					},
				] }
			/>
			<ButtonStack justify="flex-start">
				<OverviewLinkButton
					size="compact"
					variant="secondary"
					href={ leadsHref }
					shouldUseRouterLink={ shouldUseRouterLink }
				>
					{ __( 'View lead dashboard' ) }
				</OverviewLinkButton>
			</ButtonStack>
		</VStack>
	);
}

function UnlockStep( {
	isDone,
	title,
	detail,
}: {
	isDone: boolean;
	title: string;
	detail: string;
} ) {
	return (
		<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
			<div
				aria-hidden="true"
				style={ {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
					width: '24px',
					height: '24px',
					borderRadius: '50%',
					background: isDone ? 'var(--wp-admin-theme-color)' : 'transparent',
					// Same box size checked or not, so the circles line up.
					boxSizing: 'border-box',
					border: isDone
						? '1px solid var(--wp-admin-theme-color)'
						: '1px solid var(--color-gray-300, #c3c4c7)',
					color: 'var(--color-text-inverted)',
				} }
			>
				{ isDone && <Icon icon={ check } size={ 18 } style={ { fill: '#fff' } } /> }
			</div>
			<VStack spacing={ 0 }>
				<Text weight={ 500 } lineHeight="20px">
					{ title }
				</Text>
				<Text variant="muted" size={ 12 } lineHeight="16px">
					{ detail }
				</Text>
			</VStack>
		</HStack>
	);
}

function LeadsEmptyState( {
	influencedRevenue,
	tierLevel,
	isListed,
	profile,
	lockedNote,
	links,
	shouldUseRouterLink,
}: {
	influencedRevenue: number;
	tierLevel: number;
	isListed: boolean;
	profile: SignupProfile | null;
	lockedNote?: string;
	links: IarMethodLinks & { partnerDirectory: string };
	shouldUseRouterLink?: boolean;
} ) {
	const target = LEAD_UNLOCKS.qualifiedLeads;
	const gap = Math.max( target - influencedRevenue, 0 );
	const percent = Math.min( ( influencedRevenue / target ) * 100, 100 );
	const hasDirectoryUnlock = tierLevel >= 1;
	const unlockedDirectoryDetail = isListed
		? __( 'Unlocked · You’re listed' )
		: __( 'Unlocked · Finish your profile to start getting found' );
	const methods = getIarMethods( profile, links );

	return (
		<VStack spacing={ 5 }>
			<VStack spacing={ 2 }>
				<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
					{ __( 'Client leads' ) }
				</Heading>
				<Text variant="muted" lineHeight="20px">
					{ __(
						'Automattic sends qualified client leads to partners, and directory listings bring clients to you. Both unlock as your influenced revenue (IAR) grows.'
					) }
				</Text>
				{ lockedNote && (
					<HStack justify="flex-start" expanded={ false }>
						<Badge intent="draft">{ lockedNote }</Badge>
					</HStack>
				) }
			</VStack>

			<VStack spacing={ 3 }>
				<UnlockStep
					isDone={ hasDirectoryUnlock }
					title={ __( 'Partner Directory listing' ) }
					detail={
						hasDirectoryUnlock
							? unlockedDirectoryDetail
							: sprintf(
									/* translators: %s is the IAR needed, e.g. $1,200 */
									__( 'Agency Partner · %s IAR' ),
									money( LEAD_UNLOCKS.directory )
								)
					}
				/>
				<UnlockStep
					isDone={ false }
					title={ __( 'Qualified leads from Automattic' ) }
					detail={ sprintf(
						/* translators: %s is the IAR needed, e.g. $5,000 */
						__( 'Pro Partner · %s IAR' ),
						money( LEAD_UNLOCKS.qualifiedLeads )
					) }
				/>
			</VStack>

			<VStack spacing={ 2 }>
				<HStack justify="space-between" alignment="baseline">
					<Text weight={ 500 } lineHeight="20px">
						{ sprintf(
							/* translators: %s is the IAR still needed to unlock qualified leads */
							__( '%s to qualified leads' ),
							money( gap )
						) }
					</Text>
					<Text variant="muted" size={ 12 } lineHeight="16px">
						{ sprintf(
							/* translators: 1: current IAR, 2: IAR target */
							__( '%1$s of %2$s' ),
							money( influencedRevenue ),
							money( target )
						) }
					</Text>
				</HStack>
				<div
					role="progressbar"
					aria-label={ __( 'Influenced revenue toward qualified leads' ) }
					aria-valuemin={ 0 }
					aria-valuemax={ target }
					aria-valuenow={ influencedRevenue }
					style={ {
						height: '8px',
						borderRadius: '9999px',
						background: 'var(--color-gray-100, #dcdcde)',
						overflow: 'hidden',
					} }
				>
					<div
						style={ {
							width: `${ percent }%`,
							height: '100%',
							background: 'var(--wp-admin-theme-color)',
						} }
					/>
				</div>
				<Text variant="muted" size={ 12 } lineHeight="16px">
					{ __( 'IAR counts over a rolling 12 months.' ) }
				</Text>
			</VStack>

			<CardDivider style={ { borderColor: 'var(--color-gray-100)' } } />

			<VStack spacing={ 3 }>
				<Text weight={ 500 } lineHeight="20px">
					{ __( 'Ways to close the gap' ) }
				</Text>
				{ methods.map( ( method ) => (
					<HStack key={ method.id } spacing={ 4 } justify="space-between" alignment="center">
						<VStack spacing={ 0 }>
							<Text lineHeight="20px">{ method.title }</Text>
							<Text variant="muted" size={ 12 } lineHeight="16px">
								{ method.description }
							</Text>
						</VStack>
						{ ! lockedNote && (
							<span style={ { flexShrink: 0 } }>
								<OverviewLinkButton
									size="compact"
									variant="secondary"
									href={ method.href }
									shouldUseRouterLink={ shouldUseRouterLink }
								>
									{ method.actionLabel }
								</OverviewLinkButton>
							</span>
						) }
					</HStack>
				) ) }
			</VStack>
		</VStack>
	);
}

interface LeadsCardProps {
	tierLevel: number;
	influencedRevenue: number;
	isListed: boolean;
	profile: SignupProfile | null;
	lockedNote?: string;
	links: IarMethodLinks & { partnerDirectory: string };
	shouldUseRouterLink?: boolean;
}

export default function LeadsCard( {
	tierLevel,
	influencedRevenue,
	isListed,
	profile,
	lockedNote,
	links,
	shouldUseRouterLink,
}: LeadsCardProps ) {
	// Qualified leads unlock at Pro Partner (level 2).
	const hasLeads = tierLevel >= 2 && ! lockedNote;

	return (
		<Card>
			<CardBody>
				{ hasLeads ? (
					// The lead dashboard is built next; until then this points to the Partner Directory.
					<LeadsSummary
						leadsHref={ links.partnerDirectory }
						shouldUseRouterLink={ shouldUseRouterLink }
					/>
				) : (
					<LeadsEmptyState
						influencedRevenue={ influencedRevenue }
						tierLevel={ tierLevel }
						isListed={ isListed }
						profile={ profile }
						lockedNote={ lockedNote }
						links={ links }
						shouldUseRouterLink={ shouldUseRouterLink }
					/>
				) }
			</CardBody>
		</Card>
	);
}
