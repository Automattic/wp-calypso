/**
 * PROTOTYPE — proof of concept only.
 *
 * The three totals at the top of the Leads dashboard, built from the same
 * stat cards as the Referrals and WooPayments dashboards.
 */
import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalText as Text } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import ConsolidatedStatCard from '../../components/consolidated-stat-card';
import Grid from '../../components/grid';
import { getLeadValue, isOpenLead } from './lead-data';
import type { Lead } from './lead-data';

const money = ( value: number ) => formatCurrency( value, 'USD', { stripZeros: true } );

function summarize( leads: Lead[] ) {
	return {
		count: leads.length,
		value: leads.reduce( ( total, lead ) => total + getLeadValue( lead ), 0 ),
	};
}

const countLabel = ( label: string, count: number ) =>
	sprintf(
		/* translators: 1: a lead status, e.g. "Closed won", 2: number of leads */
		_n( '%1$s · %2$d lead', '%1$s · %2$d leads', count ),
		label,
		count
	);

export default function LeadStats( { leads }: { leads: Lead[] } ) {
	const won = summarize( leads.filter( ( lead ) => lead.status === 'won' ) );
	const lost = summarize( leads.filter( ( lead ) => lead.status === 'lost' ) );
	const open = summarize( leads.filter( isOpenLead ) );

	return (
		<Grid templateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap="lg">
			<ConsolidatedStatCard
				value={ money( won.value ) }
				footerText={ countLabel( __( 'Closed won' ), won.count ) }
				popoverTitle={ __( 'Closed won' ) }
				popoverContent={
					<Text>
						{ __(
							'The actual value of leads you won. Where you haven’t reported an actual value yet, the value from when the lead came in is used.'
						) }
					</Text>
				}
			/>
			<ConsolidatedStatCard
				value={ money( lost.value ) }
				footerText={ countLabel( __( 'Closed lost' ), lost.count ) }
				popoverTitle={ __( 'Closed lost' ) }
				popoverContent={
					<Text>
						{ __(
							'The value of leads that didn’t go ahead. Telling us why helps us send you better-matched leads.'
						) }
					</Text>
				}
			/>
			<ConsolidatedStatCard
				value={ money( open.value ) }
				footerText={ countLabel( __( 'In progress' ), open.count ) }
				popoverTitle={ __( 'In progress' ) }
				popoverContent={
					<Text>
						{ __(
							'New leads and leads you’re working on, at the value reported when they came in.'
						) }
					</Text>
				}
			/>
		</Grid>
	);
}
