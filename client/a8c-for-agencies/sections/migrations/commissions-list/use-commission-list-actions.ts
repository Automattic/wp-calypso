import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { TaggedSite } from '../types';

export default function useCommissionListActions( {
	onUntagSite,
	onRequestReview,
}: {
	onUntagSite: ( site: TaggedSite ) => void;
	onRequestReview: ( site: TaggedSite ) => void;
} ) {
	const translate = useTranslate();

	return useMemo( () => {
		const isRequestVerificationEnabled = isEnabled( 'a4a-migrations-request-verification' );

		return [
			{
				id: 'request-verification',
				label: translate( 'Request verification' ),
				isEligible( item: TaggedSite ) {
					return isRequestVerificationEnabled && item.incentive_status === 'pending';
				},
				callback( items: TaggedSite[] ) {
					onRequestReview( items[ 0 ] );
				},
			},
			{
				id: 'request-another-verification',
				label: translate( 'Request another verification' ),
				isEligible( item: TaggedSite ) {
					return isRequestVerificationEnabled && item.incentive_status === 'rejected';
				},
				callback( items: TaggedSite[] ) {
					onRequestReview( items[ 0 ] );
				},
			},
			{
				id: 'untag-site',
				label: translate( 'Untag site' ),
				isEligible( item: TaggedSite ) {
					return item.incentive_status === 'pending';
				},
				callback( items: TaggedSite[] ) {
					onUntagSite( items[ 0 ] );
				},
			},
		];
	}, [ translate, onRequestReview, onUntagSite ] );
}
