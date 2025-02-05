import { translate } from 'i18n-calypso';
import { SubscribersFilterBy } from '../../constants';
import './style.scss';

type SubscriberTotalsProps = {
	totalSubscribers: number;
	filteredCount: number;
	filterOption: SubscribersFilterBy;
	searchTerm: string;
	isLoading: boolean;
};

const getFilterLabel = ( filterOption: SubscribersFilterBy, count: number ): string => {
	switch ( filterOption ) {
		case SubscribersFilterBy.Paid:
			return count === 1 ? translate( 'paid subscriber' ) : translate( 'paid subscribers' );
		case SubscribersFilterBy.Free:
			return count === 1 ? translate( 'free subscriber' ) : translate( 'free subscribers' );
		case SubscribersFilterBy.EmailSubscriber:
			return count === 1 ? translate( 'email subscriber' ) : translate( 'email subscribers' );
		case SubscribersFilterBy.ReaderSubscriber:
			return count === 1 ? translate( 'reader subscriber' ) : translate( 'reader subscribers' );
		default:
			return count === 1 ? translate( 'subscriber' ) : translate( 'subscribers' );
	}
};

const SubscriberTotals: React.FC< SubscriberTotalsProps > = ( {
	totalSubscribers,
	filteredCount,
	filterOption,
	searchTerm,
	isLoading,
} ) => {
	if ( isLoading ) {
		return <div className="subscriber-totals is-loading" />;
	}

	const isFiltered = filterOption !== SubscribersFilterBy.All || !! searchTerm;
	const filterLabel = getFilterLabel( filterOption, filteredCount );

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
