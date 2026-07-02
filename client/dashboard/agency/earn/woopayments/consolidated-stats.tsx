import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	ExternalLink,
	Popover,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { Text } from '../../../components/text';
import { TextSkeleton } from '../../../components/text-skeleton';
import {
	areNextAndCurrentPayoutDatesEqual,
	getCurrentCycleActivityWindow,
	getCurrentCyclePayoutDate,
	getNextPayoutDate,
	getNextPayoutDateActivityWindow,
} from './lib/payout-dates';
import type { RecordTracksEvent } from './types';
import type { AgencyWooPaymentsData } from '@automattic/api-core';

// Inlined from client/a8c-for-agencies so the dashboard has no dependency on the classic A4A app.
const WOOPAYMENTS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';
const AGENCY_EARNINGS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function formatDateWithYear( date: Date ) {
	return date.toLocaleString( 'default', { month: 'short', day: 'numeric', year: 'numeric' } );
}

function formatDateRange( start: Date, finish: Date ) {
	return `${ formatDateWithYear( start ) } - ${ formatDateWithYear( finish ) }`;
}

function usePayoutSummary() {
	return useMemo( () => {
		const now = new Date();
		const nextPayoutWindow = getNextPayoutDateActivityWindow( now );
		const currentCycleWindow = getCurrentCycleActivityWindow( now );

		return {
			nextPayoutActivityWindow: formatDateRange( nextPayoutWindow.start, nextPayoutWindow.finish ),
			nextPayoutDate: formatDateWithYear( getNextPayoutDate( now ) ),
			currentCyclePayoutDate: formatDateWithYear( getCurrentCyclePayoutDate( now ) ),
			currentCycleActivityWindow: formatDateRange(
				currentCycleWindow.start,
				currentCycleWindow.finish
			),
			areNextAndCurrentPayoutDatesEqual: areNextAndCurrentPayoutDatesEqual( now ),
			isFullQuarter: now.toLocaleDateString() === currentCycleWindow.finish.toLocaleDateString(),
		};
	}, [] );
}

function InfoPopoverButton( { children }: { children: React.ReactNode } ) {
	const [ showPopover, setShowPopover ] = useState( false );

	return (
		<>
			<Button
				size="small"
				icon={ info }
				iconSize={ 16 }
				label={ __( 'More info' ) }
				onClick={ () => setShowPopover( true ) }
			/>
			{ showPopover && (
				<Popover
					offset={ 12 }
					placement="bottom-start"
					focusOnMount
					onClose={ () => setShowPopover( false ) }
				>
					<VStack spacing={ 3 } style={ { width: '280px', padding: '8px' } }>
						{ children }
					</VStack>
				</Popover>
			) }
		</>
	);
}

function StatCard( {
	value,
	label,
	popoverContent,
	isLoading,
}: {
	value: string;
	label: string;
	popoverContent: React.ReactNode;
	isLoading: boolean;
} ) {
	return (
		<Card style={ { flex: '1 1 240px' } }>
			<CardBody>
				<VStack spacing={ 2 }>
					{ isLoading ? (
						<TextSkeleton length={ 10 } />
					) : (
						<Text size={ 32 } weight={ 500 }>
							{ value }
						</Text>
					) }
					<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
						<Text variant="muted">{ label }</Text>
						<InfoPopoverButton>{ popoverContent }</InfoPopoverButton>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

function PayoutCardPopoverContent( {
	activityWindow,
	payoutDate,
	showEarningsToDateNote,
	today,
}: {
	activityWindow: string;
	payoutDate: string;
	showEarningsToDateNote: boolean;
	today: string;
} ) {
	return (
		<VStack spacing={ 2 }>
			<Text>
				{ __(
					'When your client buys products or hosting from Automattic for Agencies, they are billed on the first of every month rather than immediately. We estimate the commission based on the active use for the current month.'
				) }
			</Text>
			<VStack spacing={ 1 }>
				<Text>
					{ __( 'Payout range:' ) } <strong>{ activityWindow }</strong>
				</Text>
				{ showEarningsToDateNote && (
					<Text>
						{ sprintf(
							/* translators: %(today)s: a date, e.g. "Jun 12" */
							__( '(Earnings shown up to %(today)s)' ),
							{ today }
						) }
					</Text>
				) }
			</VStack>
			<Text>
				{ __( 'Payout date:' ) } <strong>{ payoutDate }*</strong>
			</Text>
			<Text>
				{ __(
					'*Commissions are paid quarterly, after a 60-day waiting period, excluding refunds and chargebacks.'
				) }
			</Text>
			<ExternalLink href={ localizeUrl( AGENCY_EARNINGS_LEARN_MORE_LINK ) }>
				{ __( 'Learn more' ) }
			</ExternalLink>
		</VStack>
	);
}

export default function WooPaymentsConsolidatedStats( {
	commissions,
	isLoading,
}: {
	commissions?: AgencyWooPaymentsData;
	isLoading: boolean;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const {
		nextPayoutActivityWindow,
		nextPayoutDate,
		currentCyclePayoutDate,
		currentCycleActivityWindow,
		areNextAndCurrentPayoutDatesEqual: isSinglePayoutCycle,
		isFullQuarter,
	} = usePayoutSummary();

	const totalCommission = commissions?.data?.total?.payout ?? 0;
	const previousQuarterExpectedCommission =
		commissions?.data?.estimated?.previous_quarter?.payout ?? 0;
	const currentQuarterExpectedCommission =
		commissions?.data?.estimated?.current_quarter?.payout ?? 0;

	const showEarningsToDateNote = ! isFullQuarter;
	const currentQuarterLabel = showEarningsToDateNote
		? __( 'Estimated current quarter earnings to date' )
		: __( 'Estimated earnings in current quarter' );
	const previousQuarterLabel = __( 'Estimated earnings in previous quarter' );
	const today = new Date().toLocaleString( 'default', { month: 'short', day: 'numeric' } );

	return (
		<HStack wrap spacing={ 4 } alignment="stretch" justify="flex-start">
			<StatCard
				value={ formatCurrency( totalCommission, 'USD' ) }
				label={ __( 'Total WooPayments commissions paid' ) }
				isLoading={ isLoading }
				popoverContent={
					<VStack spacing={ 2 }>
						<Text>
							{ __(
								'The total amount of transactions processed through WooPayments across all your client sites.'
							) }
						</Text>
						<ExternalLink href={ localizeUrl( WOOPAYMENTS_LEARN_MORE_LINK ) }>
							{ __( 'Learn more' ) }
						</ExternalLink>
					</VStack>
				}
			/>
			{ ! isSinglePayoutCycle && (
				<StatCard
					value={ formatCurrency( previousQuarterExpectedCommission, 'USD' ) }
					label={ previousQuarterLabel }
					isLoading={ isLoading }
					popoverContent={
						<PayoutCardPopoverContent
							activityWindow={ nextPayoutActivityWindow }
							payoutDate={ nextPayoutDate }
							showEarningsToDateNote={ false }
							today={ today }
						/>
					}
				/>
			) }
			<StatCard
				value={ formatCurrency( currentQuarterExpectedCommission, 'USD' ) }
				label={ currentQuarterLabel }
				isLoading={ isLoading }
				popoverContent={
					<PayoutCardPopoverContent
						activityWindow={ currentCycleActivityWindow }
						payoutDate={ currentCyclePayoutDate }
						showEarningsToDateNote={ showEarningsToDateNote }
						today={ today }
					/>
				}
			/>
		</HStack>
	);
}
