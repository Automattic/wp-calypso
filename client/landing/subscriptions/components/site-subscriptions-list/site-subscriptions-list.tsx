import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import { Spinner, __experimentalHStack as HStack, Icon, Tooltip } from '@wordpress/components';
import { info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { requestRecommendedBlogsListItems } from 'calypso/state/reader/lists/actions';
import { Notice, NoticeType } from '../notice';
import SiteSubscriptionRow from './site-subscription-row';
import './styles/site-subscriptions-list.scss';

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
	const dispatch = useDispatch();
	const currentUserName = useSelector( getCurrentUserName );
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const { filterOption, searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();
	const { subscriptions, totalCount } = data;

	const isCompactLayout = layout === 'compact';
	const isRecommendedBlogsEnabled = config.isEnabled( 'reader/recommended-blogs-list' );

	// Fetch recommended blogs data once for all subscription rows
	useEffect( () => {
		if ( currentUserName && isRecommendedBlogsEnabled ) {
			dispatch( requestRecommendedBlogsListItems( currentUserName ) );
		}
	}, [ currentUserName, dispatch, isRecommendedBlogsEnabled ] );

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
		<ul
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
				{ isRecommendedBlogsEnabled && isLoggedIn && ! isCompactLayout && (
					<span className="recommend-cell" role="columnheader">
						{ translate( 'Recommend' ) }
						<Tooltip
							className="site-subscriptions-list__recommend-tooltip"
							text={ translate(
								'Recommending a blog adds it to your profile and helps it to be discovered in the Reader.'
							) }
						>
							<span>
								<Icon
									className="site-subscriptions-list__recommend-tooltip-icon"
									icon={ info }
									size={ 16 }
								/>
							</span>
						</Tooltip>
					</span>
				) }
				<span className="unsubscribe-action-cell" role="columnheader">
					{ translate( 'Action' ) }
				</span>
				<span className="actions-cell" role="columnheader" />
			</HStack>
			{ subscriptions.map( ( siteSubscription ) => (
				<SiteSubscriptionRow
					key={ `sites.siteRow.${ siteSubscription.ID }` }
					layout={ layout }
					{ ...siteSubscription }
				/>
			) ) }
		</ul>
	);
};

export default SiteSubscriptionsList;
