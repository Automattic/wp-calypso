import { formatCurrency } from '@automattic/number-formatters';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import ConsolidatedStatCard from '../../../../components/consolidated-stat-card';
import type { TaggedSite } from '../types';

const PROGRAM_INCENTIVES_URL = 'https://automattic.com/for-agencies/program-incentives/#migrations';

const getQuarter = ( date = new Date() ) => {
	const currentMonth = date.getMonth();
	return Math.ceil( ( currentMonth + 1 ) / 3 );
};

export default function MigrationsConsolidatedCommissions( { items }: { items: TaggedSite[] } ) {
	const migrationCommissions =
		items.filter( ( item ) => {
			// Consider only verified migrations for the current quarter
			return (
				item.incentive_status === 'verified' &&
				getQuarter( new Date( item.created_at * 1000 ) ) === getQuarter()
			);
		} ).length * 100; // FIXME: Consider the maximum commission value when the MC tool is implemented

	const sitesPendingReview = items.filter( ( item ) => {
		return item.incentive_status === 'pending';
	} ).length;

	const currentQuarter = getQuarter();

	return (
		<Grid
			className="consolidated-commissions"
			templateColumns="repeat(auto-fit, minmax(240px, 1fr))"
			gap={ 4 }
		>
			<ConsolidatedStatCard
				value={ formatCurrency( migrationCommissions, 'USD' ) }
				footerText={ sprintf(
					/* translators: %d: the current quarter number. Q is the short form of "Quarter". */
					__( 'Estimated migration commissions expected in Q%d' ),
					currentQuarter
				) }
				popoverTitle={ __( 'Migration commissions' ) }
				popoverContent={
					<VStack spacing={ 3 }>
						<Text>
							{ __(
								'The amount shown is an estimate and may be adjusted at the time of payout following a review of migrated sites against the commission eligibility requirements.'
							) }
						</Text>
						<Text>
							<ExternalLink href={ PROGRAM_INCENTIVES_URL }>{ __( 'Learn more' ) }</ExternalLink>
						</Text>
					</VStack>
				}
			/>
			<ConsolidatedStatCard
				value={ sitesPendingReview }
				footerText={ __( 'Sites pending review' ) }
			/>
		</Grid>
	);
}
