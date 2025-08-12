import { formatNumber } from '@automattic/number-formatters';
import { Spinner } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { SubscribersFilterBy } from '../../constants';
import './style.scss';

type SubscriberTotalsProps = {
	totalSubscribers: number;
	filteredCount: number;
	filters: SubscribersFilterBy[];
	searchTerm: string;
	isLoading: boolean;
};

const getFilterLabel = ( filters: SubscribersFilterBy[], count: number ): string => {
	// Sort to make sure the filter order is consistent.
	const sortedFilters = [ ...filters ].sort();
	const filterKey = sortedFilters.join( ',' );

	switch ( filterKey ) {
		// Single filter cases.
		case SubscribersFilterBy.Paid:
			return translate( 'paid subscriber', 'paid subscribers', {
				count,
				args: { count },
			} ) as string;
		case SubscribersFilterBy.Free:
			return translate( 'free subscriber', 'free subscribers', {
				count,
				args: { count },
			} ) as string;
		case SubscribersFilterBy.EmailSubscriber:
			return translate( 'email subscriber', 'email subscribers', {
				count,
				args: { count },
			} ) as string;
		case SubscribersFilterBy.ReaderSubscriber:
			return translate( 'reader subscriber', 'reader subscribers', {
				count,
				args: { count },
			} ) as string;

		// Two filter combinations.
		case SubscribersFilterBy.EmailSubscriber + ',' + SubscribersFilterBy.Paid:
			return translate( 'paid email subscriber', 'paid email subscribers', {
				count,
				args: { count },
			} ) as string;
		case SubscribersFilterBy.Paid + ',' + SubscribersFilterBy.ReaderSubscriber:
			return translate( 'paid reader subscriber', 'paid reader subscribers', {
				count,
				args: { count },
			} ) as string;
		case SubscribersFilterBy.EmailSubscriber + ',' + SubscribersFilterBy.Free:
			return translate( 'free email subscriber', 'free email subscribers', {
				count,
				args: { count },
			} ) as string;
		case SubscribersFilterBy.Free + ',' + SubscribersFilterBy.ReaderSubscriber:
			return translate( 'free reader subscriber', 'free reader subscribers', {
				count,
				args: { count },
			} ) as string;

		// Default case.
		default:
			return translate( 'subscriber', 'subscribers', {
				count,
				args: { count },
			} ) as string;
	}
};

const SubscriberTotals: React.FC< SubscriberTotalsProps > = ( {
	totalSubscribers,
	filteredCount,
	filters,
	searchTerm,
	isLoading,
} ) => {
	if ( isLoading ) {
		return (
			<div className="subscriber-totals is-loading">
				<Spinner />
			</div>
		);
	}

	const isFiltered = ! filters.includes( SubscribersFilterBy.All ) || !! searchTerm;
	const isFilteredByUnconfirmed = filters.includes( SubscribersFilterBy.UnconfirmedSubscriber );
	const filterLabel = getFilterLabel( filters, filteredCount );

	// Handle unfiltered case. This is the default case where we show the total subscribers count.
	if ( ! isFiltered ) {
		return (
			<div className="subscriber-totals">
				<span className="subscriber-totals__total-count">
					{ translate(
						'%(subscriberCount)s total subscriber',
						'%(subscriberCount)s total subscribers',
						{
							count: totalSubscribers,
							args: { subscriberCount: formatNumber( totalSubscribers ) },
						}
					) }
				</span>
			</div>
		);
	}

	// Handle unconfirmed subscribers case. This is a special case where we don't want to show the total subscribers count since unconfirmed subscribers are not part of the total.
	if ( isFilteredByUnconfirmed ) {
		return (
			<div className="subscriber-totals">
				<span className="subscriber-totals__total-count">
					{ translate( '%(count)d unconfirmed subscriber', '%(count)d unconfirmed subscribers', {
						count: filteredCount,
						args: { count: filteredCount },
					} ) }
				</span>
			</div>
		);
	}

	// Handle filtered case. This is the case where we show the filtered subscribers count.
	return (
		<div className="subscriber-totals">
			<span className="subscriber-totals__filtered-count">
				{ searchTerm
					? translate(
							'%(matchingSubscriberCount)s matching result',
							'%(matchingSubscriberCount)s matching results',
							{
								count: filteredCount,
								args: { matchingSubscriberCount: formatNumber( filteredCount ) },
							}
					  )
					: translate( '%(filteredSubscriberCount)s %(filterLabel)s', {
							args: {
								filteredSubscriberCount: formatNumber( filteredCount ),
								filterLabel,
							},
					  } ) }
			</span>
			<span className="subscriber-totals__total">
				{ translate( 'out of %(totalSubscriberCount)s total subscribers', {
					args: { totalSubscriberCount: formatNumber( totalSubscribers ) },
				} ) }
			</span>
		</div>
	);
};

export default SubscriberTotals;
