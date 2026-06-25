import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

function getBoostRating( score: number ): string {
	if ( score > 90 ) {
		return 'A';
	}
	if ( score > 75 ) {
		return 'B';
	}
	if ( score > 50 ) {
		return 'C';
	}
	if ( score > 35 ) {
		return 'D';
	}
	if ( score > 25 ) {
		return 'E';
	}
	return 'F';
}

export function getBoostField(): Field< AgencySite > {
	return {
		id: 'agency_boost',
		label: __( 'Boost' ),
		enableSorting: false,
		getValue: ( { item } ) => item.jetpack_boost_scores?.overall ?? 0,
		render: ( { item } ) => {
			const score = item.jetpack_boost_scores?.overall;
			// A score of 0 is a valid rating (F), so check for presence, not truthiness.
			return typeof score === 'number' ? (
				<>{ getBoostRating( score ) }</>
			) : (
				// TODO: wire up the Boost setup flow; this button is inert for now.
				<Button variant="tertiary">{ __( 'Add' ) }</Button>
			);
		},
	};
}
