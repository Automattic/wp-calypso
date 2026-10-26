import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useIntlLocale } from '../../../app/locale';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { onLeaveClick } from '../../crossover/store';
import { OWNER_ROLE } from '../../team/constants';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { calculateEffectiveCapacity } from './lib/pressable-capacity';
import { PRESSABLE_AGENCY_URL, getPressablePlanInfo } from './lib/pressable-plans';
import PressableUsageStats from './pressable-usage-stats';
import type { AgencyProduct } from '@automattic/api-core';

const formatTrialEndDate = ( date: string, locale: string ) =>
	new Intl.DateTimeFormat( locale, { month: 'long', day: 'numeric', timeZone: 'UTC' } ).format(
		new Date( date )
	);

const formatInboxCount = ( count: number ) =>
	sprintf(
		/* translators: %d is a number of email inboxes. */
		_n( '%d inbox', '%d inboxes', count ),
		count
	);

/** The agency's current plan, its usage and its Titan Email inboxes; add-on licenses raise the limits. */
export default function PressableUsageCard( { existingPlan }: { existingPlan: AgencyProduct } ) {
	const locale = useIntlLocale();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { licenses, products } = useAgencyPressablePlan();
	const planInfo = getPressablePlanInfo( existingPlan );
	if ( ! planInfo ) {
		return null;
	}

	// A new plan has no usage until Pressable reports it, usually the next day.
	const pressable = agency?.third_party?.pressable;
	const usage = pressable?.usage ?? undefined;
	const capacity = calculateEffectiveCapacity( planInfo, licenses, products );
	const activeTitanOrders = ( pressable?.titan_usage?.orders ?? [] ).filter(
		( order ) => order.status === 'active'
	);
	const totalInboxes = activeTitanOrders.reduce(
		( sum, order ) => sum + order.billable_inboxes,
		0
	);

	// Only the agency owner can sign in to the Pressable account.
	const isAgencyOwner = agency?.user?.role === OWNER_ROLE;

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 3 }
					title={ sprintf(
						/* translators: %s is the plan name, e.g. "Pressable Signature 4". */
						__( 'Your %s plan' ),
						existingPlan.name
					) }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<PressableUsageStats usage={ usage } capacity={ capacity } />
					{ activeTitanOrders.length > 0 && (
						<VStack spacing={ 4 }>
							<HStack justify="space-between" alignment="flex-start" wrap>
								<Text weight={ 500 }>{ __( 'Titan Email' ) }</Text>
								<Text variant="muted">
									{ sprintf(
										/* translators: %1$s is a number of inboxes, e.g. "7 inboxes"; %2$s is a number of domains, e.g. "2 domains". */
										__( '%1$s across %2$s' ),
										formatInboxCount( totalInboxes ),
										sprintf(
											/* translators: %d is the number of domains with email inboxes. */
											_n( '%d domain', '%d domains', activeTitanOrders.length ),
											activeTitanOrders.length
										)
									) }
								</Text>
							</HStack>
							{ activeTitanOrders.map( ( order ) => (
								<HStack key={ order.domain } justify="space-between" alignment="flex-start">
									<HStack spacing={ 2 } justify="flex-start" expanded={ false } wrap>
										<Text weight={ 500 }>{ order.domain }</Text>
										{ order.trial_end_at && (
											<Text variant="muted">
												{ sprintf(
													/* translators: %s is the trial end date, e.g. "October 3". */
													__( 'Trial ends %s' ),
													formatTrialEndDate( order.trial_end_at, locale )
												) }
											</Text>
										) }
									</HStack>
									<Text variant="muted">{ formatInboxCount( order.billable_inboxes ) }</Text>
								</HStack>
							) ) }
						</VStack>
					) }
					{ isAgencyOwner && (
						<>
							<CardDivider />
							<div>
								<ExternalLink
									href={ PRESSABLE_AGENCY_URL }
									onClick={ onLeaveClick( 'pressable', PRESSABLE_AGENCY_URL ) }
								>
									{ __( 'Manage in Pressable' ) }
								</ExternalLink>
							</div>
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
