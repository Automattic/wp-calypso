import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { ReactNode, useMemo } from 'react';

/**
 * Custom hook to get formatted expiration lines for credits
 */
export const useCreditExpirationLines = (
	sortedHistory: Array< { amount: number; expires: string } >,
	shortText: boolean
): ReactNode[] | null => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( ! sortedHistory || sortedHistory.length === 0 ) {
			return null;
		}

		if ( sortedHistory.length === 1 ) {
			const firstItem = sortedHistory[ 0 ];
			const firstDate = moment( firstItem.expires ).format( shortText ? 'L' : 'LL' );
			const firstAmount = formatCurrency( firstItem.amount, 'USD', { isSmallestUnit: true } );

			return [
				translate( 'You have %(amount)s in credits expiring on %(firstDate)s.', {
					args: { amount: firstAmount, firstDate },
				} ),
			];
		}

		const header = translate( 'You have several credit assignations:' );
		const items = sortedHistory.map( ( item ) => {
			const amount = formatCurrency( item.amount, 'USD', { isSmallestUnit: true } );
			const date = moment( item.expires ).format( shortText ? 'L' : 'LL' );
			return shortText
				? translate( '%(amount)s expiring on %(date)s', {
						args: { amount, date },
				  } )
				: translate( '%(amount)s in credits expiring on %(date)s', {
						args: { amount, date },
				  } );
		} );

		return [ header, ...items ];
	}, [ sortedHistory, shortText, translate ] );
};
