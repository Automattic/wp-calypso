import { isEnabled } from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import type { TaggedSite } from 'calypso/dashboard/agency/earn/migrations/types';

export default function useCommissionListActions( {
	onUntagSite,
	onRequestReview,
}: {
	onUntagSite: ( site: TaggedSite ) => void;
	onRequestReview: ( site: TaggedSite ) => void;
} ) {
	return useMemo( () => {
		const isRequestVerificationEnabled = isEnabled( 'a4a-migrations-request-verification' );

		return [
			{
				id: 'request-verification',
				label: __( 'Request verification' ),
				isEligible( item: TaggedSite ) {
					return isRequestVerificationEnabled && item.incentive_status === 'pending';
				},
				callback( items: TaggedSite[] ) {
					onRequestReview( items[ 0 ] );
				},
			},
			{
				id: 'request-another-verification',
				label: __( 'Request another verification' ),
				isEligible( item: TaggedSite ) {
					return (
						isRequestVerificationEnabled &&
						( item.incentive_status === 'rejected' || item.incentive_status === 'ineligible' )
					);
				},
				callback( items: TaggedSite[] ) {
					onRequestReview( items[ 0 ] );
				},
			},
			{
				id: 'untag-site',
				label: __( 'Untag site' ),
				isEligible( item: TaggedSite ) {
					return item.incentive_status === 'pending';
				},
				callback( items: TaggedSite[] ) {
					onUntagSite( items[ 0 ] );
				},
			},
		];
	}, [ onRequestReview, onUntagSite ] );
}
