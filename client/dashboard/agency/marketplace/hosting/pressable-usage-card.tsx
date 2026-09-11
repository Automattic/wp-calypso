import { activeAgencyQuery } from '@automattic/api-queries';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useIntlLocale } from '../../../app/locale';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Stat } from '../../../components/stat';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { calculateEffectiveCapacity } from './lib/pressable-capacity';
import { getPressablePlan } from './lib/pressable-plans';
import type { AgencyProduct } from '@automattic/api-core';

const TITAN_INBOX_MONTHLY_PRICE = 3.5;

const percentage = ( value: number, total: number ) =>
	total > 0 ? Math.min( 100, Math.round( ( value / total ) * 100 ) ) : 0;

const formatTrialEndDate = ( date: string, locale: string ) =>
	new Intl.DateTimeFormat( locale, { month: 'long', day: 'numeric', timeZone: 'UTC' } ).format(
		new Date( date )
	);

/** The agency's current plan and its usage; add-on licenses raise the limits. */
export default function PressableUsageCard( { existingPlan }: { existingPlan: AgencyProduct } ) {
	const locale = useIntlLocale();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { licenses } = useAgencyPressablePlan();
	const planInfo = getPressablePlan( existingPlan.slug );
	if ( ! planInfo ) {
		return null;
	}

	// The usage is only there once the Pressable account is linked.
	const pressable = agency?.third_party?.pressable;
	const usage = pressable?.usage ?? undefined;
	const capacity = calculateEffectiveCapacity( planInfo, licenses );
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

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 3 }
					title={
						<HStack as="span" spacing={ 2 } justify="flex-start" expanded={ false }>
							<span>{ existingPlan.name }</span>
							<Badge>{ __( 'Plan' ) }</Badge>
						</HStack>
					}
					description={ __( 'Your current Pressable plan' ) }
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					{ ! usage && (
						<Text variant="muted">{ __( 'View your usage data here when it’s available.' ) }</Text>
					) }
					<div className="dashboard-marketplace-hosting__grid dashboard-marketplace-hosting__grid--3">
						<Stat
							density="high"
							strapline={ __( 'Storage used' ) }
							metric={ sprintf(
								/* translators: %s is the storage used in GB. */
								__( '%s GB' ),
								formatNumber( storageUsed )
							) }
							description={ sprintf(
								/* translators: %s is the storage limit in GB. */
								__( 'of %s GB' ),
								formatNumber( capacity.storage )
							) }
							progressValue={ percentage( storageUsed, capacity.storage ) }
						/>
						<Stat
							density="high"
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
							strapline={ __( 'Monthly visits' ) }
							metric={ formatNumber( visitsUsed ) }
							description={ sprintf(
								/* translators: %s is the maximum number of monthly visits. */
								__( 'of %s' ),
								formatNumber( capacity.visits )
							) }
							progressValue={ percentage( visitsUsed, capacity.visits ) }
						/>
					</div>
					{ activeTitanOrders.length > 0 && (
						<>
							<CardDivider />
							<VStack spacing={ 3 }>
								<HStack justify="space-between" alignment="flex-start" wrap>
									<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
										<Text weight={ 600 }>{ __( 'Titan Email' ) }</Text>
										<Badge>{ __( 'add-on' ) }</Badge>
									</HStack>
									<VStack spacing={ 0 } alignment="flex-end">
										<Text>
											{ sprintf(
												/* translators: %d is the total number of active email inboxes. */
												_n( '%d inbox', '%d inboxes', totalInboxes ),
												totalInboxes
											) }
										</Text>
										<Text variant="muted" size={ 12 }>
											{ sprintf(
												/* translators: %s is the price per inbox. */
												__( '%s per inbox monthly' ),
												formatCurrency( TITAN_INBOX_MONTHLY_PRICE, 'USD' )
											) }
										</Text>
									</VStack>
								</HStack>
								{ activeTitanOrders.map( ( order ) => (
									<HStack key={ order.domain } justify="space-between" alignment="flex-start" wrap>
										<HStack spacing={ 2 } justify="flex-start" expanded={ false } wrap>
											<Text>{ order.domain }</Text>
											<Badge>{ __( 'standard' ) }</Badge>
											{ order.trial_end_at && (
												<>
													<Badge intent="informational">{ __( 'trial' ) }</Badge>
													<Text variant="muted" size={ 12 }>
														{ sprintf(
															/* translators: %s is the formatted trial end date. */
															__( 'The trial ends by %s' ),
															formatTrialEndDate( order.trial_end_at, locale )
														) }
													</Text>
												</>
											) }
										</HStack>
										<Text variant="muted">
											{ sprintf(
												/* translators: %d is the number of inboxes on the domain. */
												_n( '%d inbox', '%d inboxes', order.billable_inboxes ),
												order.billable_inboxes
											) }
										</Text>
									</HStack>
								) ) }
							</VStack>
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
