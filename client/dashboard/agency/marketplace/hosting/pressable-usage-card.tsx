import { activeAgencyQuery } from '@automattic/api-queries';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
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
import { Stat } from '../../../components/stat';
import { OWNER_ROLE } from '../../team/constants';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { calculateEffectiveCapacity } from './lib/pressable-capacity';
import { getPressablePlanInfo } from './lib/pressable-plans';
import type { AgencyProduct } from '@automattic/api-core';

const PRESSABLE_AGENCY_URL = 'https://my.pressable.com/agency/auth';
const USAGE_WARNING_THRESHOLD = 80;

const percentage = ( value: number, total: number ) =>
	total > 0 ? Math.min( 100, Math.round( ( value / total ) * 100 ) ) : 0;

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

	const storageUsed = usage?.storage_gb ?? 0;
	const sitesUsed = usage?.sites_count ?? 0;
	const visitsUsed = usage?.visits_count ?? 0;
	const storagePercent = percentage( storageUsed, capacity.storage );
	const visitsPercent = percentage( visitsUsed, capacity.visits );
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
					{ ! usage && (
						<Text variant="muted">{ __( 'View your usage data here when it’s available.' ) }</Text>
					) }
					<Stat
						density="high"
						isLoading={ ! usage }
						strapline={ __( 'Sites created' ) }
						metric={ formatNumber( sitesUsed ) }
						description={ sprintf(
							/* translators: %s is the maximum number of sites. */
							__( 'of %s' ),
							formatNumber( capacity.install )
						) }
						progressValue={ percentage( sitesUsed, capacity.install ) }
					/>
					<Stat
						density="high"
						isLoading={ ! usage }
						strapline={ __( 'Visits this month' ) }
						metric={ formatNumberCompact( visitsUsed ) }
						description={ sprintf(
							/* translators: %s is the maximum number of monthly visits. */
							__( 'of %s' ),
							formatNumberCompact( capacity.visits )
						) }
						progressValue={ visitsPercent }
						progressColor={ visitsPercent > USAGE_WARNING_THRESHOLD ? 'alert-yellow' : undefined }
					/>
					<Stat
						density="high"
						isLoading={ ! usage }
						strapline={ __( 'Storage used' ) }
						metric={ sprintf(
							/* translators: %s is the storage used in GB. */
							__( '%sGB' ),
							formatNumber( storageUsed )
						) }
						description={ sprintf(
							/* translators: %s is the storage limit in GB. */
							__( 'of %sGB' ),
							formatNumber( capacity.storage )
						) }
						progressValue={ storagePercent }
						progressColor={ storagePercent > USAGE_WARNING_THRESHOLD ? 'alert-yellow' : undefined }
					/>
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
								<ExternalLink href={ PRESSABLE_AGENCY_URL }>
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
