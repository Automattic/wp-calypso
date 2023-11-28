import page from '@automattic/calypso-router';
import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Nav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import {
	SubscriptionsPortal,
	SubscriptionManagerContextProvider,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { SubscriptionsEllipsisMenu } from 'calypso/landing/subscriptions/components/subscriptions-ellipsis-menu';
import { useDispatch } from 'calypso/state';
import { markFollowsAsStale } from 'calypso/state/reader/follows/actions';
import './style.scss';

const useMarkFollowsAsStaleOnUnmount = () => {
	const dispatch = useDispatch();
	useEffect( () => {
		return () => {
			dispatch( markFollowsAsStale() );
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
};

const getSelectedTab = ( pathname: string ) => {
	if ( pathname.includes( 'comments' ) ) {
		return 'comments';
	}
	if ( pathname.includes( 'pending' ) ) {
		return 'pending';
	}
	return 'sites';
};

type SubscriptionsManagerWrapperProps = {
	actionButton?: React.ReactNode;
	children: React.ReactNode;
	ellipsisMenuItems?: React.ReactNode;
	headerText: string;
	subHeaderText: React.ReactNode;
};

const SubscriptionsManagerWrapper = ( {
	actionButton,
	children,
	ellipsisMenuItems,
	headerText,
	subHeaderText,
}: SubscriptionsManagerWrapperProps ) => {
	const translate = useTranslate();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();
	const selectedTab = getSelectedTab( page.current );

	// Mark follows as stale on unmount to ensure that the reader
	// redux store is in a consistent state when the user navigates.
	// This is necessary because the subscription manager does not
	// sync its subscriptions state with the reader redux store.
	useMarkFollowsAsStaleOnUnmount();

	return (
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
			<Main className="site-subscriptions-manager">
				<DocumentHead title={ translate( 'Manage subscriptions' ) } />
				<NavigationHeader
					title={ headerText }
					subtitle={
						<>
							{ subHeaderText }{ ' ' }
							<a href="/me/notifications/subscriptions?referrer=management">
								{ translate( 'Manage notification settings' ) }
							</a>
						</>
					}
				>
					{ actionButton }

					{ ellipsisMenuItems && (
						<SubscriptionsEllipsisMenu
							toggleTitle={ translate( 'More' ) }
							popoverClassName="site-subscriptions-manager__import-export-popover"
							verticalToggle
						>
							{ ellipsisMenuItems }
						</SubscriptionsEllipsisMenu>
					) }
				</NavigationHeader>

				<Nav className="site-subscriptions-manager__nav">
					<NavTabs>
						<NavItem
							count={ counts?.blogs }
							selected={ selectedTab === 'sites' }
							onClick={ () => page( '/read/subscriptions' ) }
						>
							{ translate( 'Sites' ) }
						</NavItem>
						<NavItem
							count={ counts?.comments }
							selected={ selectedTab === 'comments' }
							onClick={ () => page( '/read/subscriptions/comments' ) }
						>
							{ translate( 'Comments' ) }
						</NavItem>
						{ !! counts?.pending && (
							<NavItem
								count={ counts?.pending }
								selected={ selectedTab === 'pending' }
								onClick={ () => page( '/read/subscriptions/pending' ) }
							>
								{ translate( 'Pending' ) }
							</NavItem>
						) }
					</NavTabs>
				</Nav>

				{ children }
			</Main>
		</SubscriptionManagerContextProvider>
	);
};

export default SubscriptionsManagerWrapper;
