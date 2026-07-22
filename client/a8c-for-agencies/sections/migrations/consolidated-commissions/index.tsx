import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import type { TaggedSite } from 'calypso/dashboard/agency/earn/migrations/types';

import './style.scss';

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
				getQuarter( new Date( item.created_at ) ) === getQuarter()
			);
		} ).length * 100; // FIXME: Consider the maximum commission value when the MC tool is implemented

	const sitesPendingReview = items.filter( ( item ) => {
		return item.incentive_status === 'pending';
	} ).length;

	const currentQuarter = getQuarter();

	return (
		<div className="consolidated-commissions">
			<Card className="consolidated-commissions__card">
				<CardBody>
					<VStack spacing={ 2 }>
						<Text size={ 20 } weight={ 500 } color="var(--color-accent-100)">
							${ migrationCommissions }
						</Text>
						<Text
							className="consolidated-commissions__label"
							size={ 13 }
							color="var(--color-accent)"
						>
							{ sprintf(
								/* translators: %d: the current quarter number. Q is the short form of "Quarter". */
								__( 'Migration commissions expected in Q%d' ),
								currentQuarter
							) }
						</Text>
					</VStack>
				</CardBody>
			</Card>
			<Card className="consolidated-commissions__card">
				<CardBody>
					<VStack spacing={ 2 }>
						<Text size={ 20 } weight={ 500 } color="var(--color-accent-100)">
							{ sitesPendingReview }
						</Text>
						<Text
							className="consolidated-commissions__label"
							size={ 13 }
							color="var(--color-accent)"
						>
							{ __( 'Sites pending review' ) }
						</Text>
					</VStack>
				</CardBody>
			</Card>
		</div>
	);
}
