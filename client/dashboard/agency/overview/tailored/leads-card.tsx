/**
 * PROTOTYPE — proof of concept only.
 *
 * Client leads card for the tailored Overview, alongside the Referral and
 * WooPayments cards.
 * - Pro tier and above: open lead value plus simple status rows (New, In
 *   progress, Closed), matching the Referral and WooPayments cards, with a
 *   link to the lead dashboard (to be built).
 * - Below Pro: an empty state with the IAR gap to the next unlock (partner
 *   directory listings at $1,200, then qualified leads at $5,000) and the IAR
 *   methods that fit this agency best.
 */
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { Text } from '../../../components/text';
import { getLeadStatusLabels, getLeadValue, isOpenLead, useLeads } from '../../leads/lead-data';
import OverviewLinkButton from '../overview-link-button';
import StatList from '../stat-list';
import { LEAD_UNLOCKS, getIarMethods } from './leads';
import type { IarMethodLinks } from './leads';
import type { SignupProfile } from './signup-profile';
import type { LeadStatus } from '../../leads/lead-data';
import './style.scss';

const money = ( value: number ) => formatCurrency( value, 'USD', { stripZeros: true } );

function LeadsSummary( {
	leadsHref,
	shouldUseRouterLink,
}: {
	leadsHref: string;
	shouldUseRouterLink?: boolean;
} ) {
	// Same leads as the Leads dashboard, so edits made there show here too.
	const leads = useLeads();
	const labels = getLeadStatusLabels();
	const countOf = ( status: LeadStatus ) =>
		leads.filter( ( lead ) => lead.status === status ).length;
	const openValue = leads
		.filter( isOpenLead )
		.reduce( ( total, lead ) => total + getLeadValue( lead ), 0 );
	const wonValue = leads
		.filter( ( lead ) => lead.status === 'won' )
		.reduce( ( total, lead ) => total + getLeadValue( lead ), 0 );

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
							/* translators: %s is the total value of leads won */
							__( 'Closed won (%s)' ),
							money( wonValue )
						),
						value: formatNumber( countOf( 'won' ) ),
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

function LeadsEmptyState( {
	influencedRevenue,
	tierLevel,
	profile,
	lockedNote,
	links,
	shouldUseRouterLink,
}: {
	influencedRevenue: number;
	tierLevel: number;
	profile: SignupProfile | null;
	lockedNote?: string;
	links: IarMethodLinks & { partnerDirectory: string; leads: string };
	shouldUseRouterLink?: boolean;
} ) {
	const hasDirectoryUnlock = tierLevel >= 1;
	// Directory listings bring in the first leads, so they're the first target.
	const target = hasDirectoryUnlock ? LEAD_UNLOCKS.qualifiedLeads : LEAD_UNLOCKS.directory;
	const gap = Math.max( target - influencedRevenue, 0 );
	const percent = Math.min( ( influencedRevenue / target ) * 100, 100 );
	const methods = getIarMethods( profile, links );
	const [ showMethods, setShowMethods ] = useState( false );

	return (
		<VStack spacing={ 5 }>
			<VStack spacing={ 2 }>
				<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
					{ __( 'Client leads' ) }
				</Heading>
				<Text variant="muted" lineHeight="20px">
					{ hasDirectoryUnlock
						? __(
								'Automattic sends qualified client leads to partners, and directory listings bring clients to you. Both unlock as your influenced revenue (IAR) grows.'
							)
						: // Below Agency Partner, the focus is the first unlock: the directories.
							sprintf(
								/* translators: %s is the IAR needed, e.g. $1,200 */
								__(
									'Partner directory listings bring clients to you. They unlock at %s in influenced revenue (IAR).'
								),
								money( LEAD_UNLOCKS.directory )
							) }
				</Text>
				{ lockedNote && (
					<HStack justify="flex-start" expanded={ false }>
						<Badge intent="draft">{ lockedNote }</Badge>
					</HStack>
				) }
			</VStack>

			<VStack spacing={ 2 }>
				<HStack justify="space-between" alignment="baseline">
					<Text weight={ 500 } lineHeight="20px">
						{ hasDirectoryUnlock
							? sprintf(
									/* translators: %s is the IAR still needed to unlock qualified leads */
									__( '%s to qualified leads' ),
									money( gap )
								)
							: sprintf(
									/* translators: %s is the IAR still needed to unlock directory listings */
									__( '%s to partner directory listings' ),
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
					aria-label={
						hasDirectoryUnlock
							? __( 'Influenced revenue toward qualified leads' )
							: __( 'Influenced revenue toward partner directory listings' )
					}
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
				{ /* Closed by default, so the card stays close to the referral card's height. */ }
				<Button
					className="a4a-plan-goal-toggle"
					aria-expanded={ showMethods }
					aria-controls="a4a-leads-iar-methods"
					onClick={ () => setShowMethods( ( value ) => ! value ) }
				>
					<Text weight={ 500 } lineHeight="20px">
						{ __( 'Ways to close the gap' ) }
					</Text>
					<Icon icon={ showMethods ? chevronUp : chevronDown } size={ 24 } />
				</Button>
				{ showMethods && (
					<VStack spacing={ 3 } id="a4a-leads-iar-methods">
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
				) }
			</VStack>
		</VStack>
	);
}

interface LeadsCardProps {
	tierLevel: number;
	influencedRevenue: number;
	profile: SignupProfile | null;
	lockedNote?: string;
	links: IarMethodLinks & { partnerDirectory: string; leads: string };
	shouldUseRouterLink?: boolean;
}

export default function LeadsCard( {
	tierLevel,
	influencedRevenue,
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
					<LeadsSummary leadsHref={ links.leads } shouldUseRouterLink={ shouldUseRouterLink } />
				) : (
					<LeadsEmptyState
						influencedRevenue={ influencedRevenue }
						tierLevel={ tierLevel }
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
