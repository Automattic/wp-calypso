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
			return count === 1 ? translate( 'paid subscriber' ) : translate( 'paid subscribers' );
		case SubscribersFilterBy.Free:
			return count === 1 ? translate( 'free subscriber' ) : translate( 'free subscribers' );
		case SubscribersFilterBy.EmailSubscriber:
			return count === 1 ? translate( 'email subscriber' ) : translate( 'email subscribers' );
		case SubscribersFilterBy.ReaderSubscriber:
			return count === 1 ? translate( 'reader subscriber' ) : translate( 'reader subscribers' );

		// Two filter combinations.
		case SubscribersFilterBy.EmailSubscriber + ',' + SubscribersFilterBy.Paid:
			return count === 1
				? translate( 'paid email subscriber' )
				: translate( 'paid email subscribers' );
		case SubscribersFilterBy.Paid + ',' + SubscribersFilterBy.ReaderSubscriber:
			return count === 1
				? translate( 'paid reader subscriber' )
				: translate( 'paid reader subscribers' );
		case SubscribersFilterBy.EmailSubscriber + ',' + SubscribersFilterBy.Free:
			return count === 1
				? translate( 'free email subscriber' )
				: translate( 'free email subscribers' );
		case SubscribersFilterBy.Free + ',' + SubscribersFilterBy.ReaderSubscriber:
			return count === 1
				? translate( 'free reader subscriber' )
				: translate( 'free reader subscribers' );

		// Default case.
		default:
			return count === 1 ? translate( 'subscriber' ) : translate( 'subscribers' );
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
	const filterLabel = getFilterLabel( filters, filteredCount );

	return (
		<div className="subscriber-totals">
			{ isFiltered ? (
				<>
					<span className="subscriber-totals__filtered-count">
						{ searchTerm
							? translate( '%(count)d matching result', '%(count)d matching results', {
									count: filteredCount,
									args: { count: filteredCount },
							  } )
							: translate( '%(count)d %(filterLabel)s', {
									args: {
										count: filteredCount,
										filterLabel,
									},
							  } ) }
					</span>
					<span className="subscriber-totals__total">
						{ translate( 'out of %(total)d total subscribers', {
							args: { total: totalSubscribers },
						} ) }
					</span>
				</>
			) : (
				<span className="subscriber-totals__total-count">
					{ translate( '%(count)d total subscriber', '%(count)d total subscribers', {
						count: totalSubscribers,
						args: { count: totalSubscribers },
					} ) }
				</span>
			) }
		</div>
	);
};

export default SubscriberTotals;
