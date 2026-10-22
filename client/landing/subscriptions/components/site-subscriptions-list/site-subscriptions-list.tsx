import { SubscriptionManager } from '@automattic/data-stores';
import { Spinner, __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { info } from '@wordpress/icons';
import { Popover, VisuallyHidden } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Notice, NoticeType } from '../notice';
import { VirtualizedList } from '../virtualized-list';
import SiteSubscriptionRow from './site-subscription-row';
import './styles/site-subscriptions-list.scss';
import type { SiteSubscriptionItem } from '@automattic/data-stores/src/reader';

type SiteSubscriptionsListProps = {
	emptyComponent?: React.ComponentType;
	notFoundComponent?: React.ComponentType;
	layout?: 'full' | 'compact';
};

const SiteSubscriptionsList: React.FC< SiteSubscriptionsListProps > = ( {
	emptyComponent: EmptyComponent,
	notFoundComponent: NotFoundComponent,
	layout = 'full',
} ) => {
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const { filterOption, searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();
	const { subscriptions, totalCount } = data;

	const isCompactLayout = layout === 'compact';

	const filteredSubscriptions = useMemo(
		() => subscriptions.filter( ( subscription ) => ! subscription.isDeleted ),
		[ subscriptions ]
	);

	if ( error ) {
		return (
			<Notice type={ NoticeType.Error }>
				{ translate(
					'We had a small hiccup loading your subscriptions. Please try refreshing the page.'
				) }
			</Notice>
		);
	}

	if ( isLoading ) {
		return (
			<div className="loading-container">
				<Spinner />
			</div>
		);
	}

	if ( ! isLoading && ! totalCount ) {
		if ( EmptyComponent ) {
			return <EmptyComponent />;
		}
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any sites.' ) }
			</Notice>
		);
	}

	if ( totalCount > 0 && subscriptions.length === 0 ) {
		if ( NotFoundComponent ) {
			return <NotFoundComponent />;
		}
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
					components: { italic: <i /> },
					args: searchTerm || filterOption,
				} ) }
			</Notice>
		);
	}

	return (
		<div
			className={ `site-subscriptions-list${
				isCompactLayout ? ' site-subscriptions-list--compact' : ''
			}` }
			role="table"
		>
			<HStack className="row header" role="row" as="li" alignment="center">
				<span className="title-cell" role="columnheader">
					{ translate( 'Subscribed site' ) }
				</span>
				<span className="date-cell" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				{ isLoggedIn && ! isCompactLayout && (
					<span className="new-posts-cell" role="columnheader">
						{ translate( 'New posts' ) }
					</span>
				) }
				{ isLoggedIn && ! isCompactLayout && (
					<span className="new-comments-cell" role="columnheader">
						{ translate( 'New comments' ) }
					</span>
				) }
				<span className="email-frequency-cell" role="columnheader">
					{ translate( 'Email frequency' ) }
				</span>
				{ isLoggedIn && ! isCompactLayout && (
					<span className="recommend-cell" role="columnheader">
						{ translate( 'Recommend' ) }
						<Popover.Root>
							<Popover.Trigger
								openOnHover
								delay={ 200 }
								closeDelay={ 200 }
								aria-label={ translate( 'More information' ) }
								className="site-subscriptions-list__recommend-tooltip-trigger"
							>
								<Icon
									className="site-subscriptions-list__recommend-tooltip-icon"
									icon={ info }
									size={ 16 }
								/>
							</Popover.Trigger>
							<Popover.Popup className="site-subscriptions-list__recommend-tooltip">
								<Popover.Arrow />
								<VisuallyHidden render={ <Popover.Title /> }>
									{ translate( 'More information' ) }
								</VisuallyHidden>
								<Popover.Description>
									{ translate(
										'Recommending a blog adds it to your profile and helps it to be discovered in the Reader.'
									) }
								</Popover.Description>
							</Popover.Popup>
						</Popover.Root>
					</span>
				) }
				<span className="unsubscribe-action-cell" role="columnheader">
					{ translate( 'Action' ) }
				</span>
				<span className="actions-cell" role="columnheader" />
			</HStack>

			<VirtualizedList< SiteSubscriptionItem > items={ filteredSubscriptions }>
				{ ( { item, key, style, registerChild } ) => (
					<SiteSubscriptionRow
						{ ...item }
						key={ `${ item.ID }-${ key }` }
						style={ style }
						forwardedRef={ registerChild }
						layout={ layout }
					/>
				) }
			</VirtualizedList>
		</div>
	);
};

export default SiteSubscriptionsList;
