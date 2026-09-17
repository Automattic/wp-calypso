import { useI18n } from '@wordpress/react-i18n';
import { DomainSuggestionBadge } from '../../ui';
import { hasSalePrice, NamePulseDomainStatus, type NamePulseDomainResult } from '../helpers';

/**
 * Bulk results carry no premium pricing; the badge stands in for the price
 * until the real-time check on click fills it in.
 */
export const getResultBadges = ( result: NamePulseDomainResult ) => {
	const isAvailable = result.status === NamePulseDomainStatus.AVAILABLE;

	return {
		sale: isAvailable && hasSalePrice( result ),
		premium: isAvailable && !! result.is_premium && ! result.is_realtime,
	};
};

export const NamePulseResultBadges = ( {
	sale,
	premium,
}: ReturnType< typeof getResultBadges > ) => {
	const { __ } = useI18n();

	return (
		<>
			{ sale && (
				<DomainSuggestionBadge variation="warning">{ __( 'Sale' ) }</DomainSuggestionBadge>
			) }
			{ premium && (
				<DomainSuggestionBadge variation="warning">{ __( 'Premium' ) }</DomainSuggestionBadge>
			) }
		</>
	);
};
