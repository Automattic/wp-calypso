import {
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
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

type SubscriptionsManagerWrapperProps = {
	actionButton?: React.ReactNode;
	children: React.ReactNode;
	ellipsisMenuItems?: React.ReactNode;
	headerText: string;
	subHeaderText: string;
};

const SubscriptionsManagerWrapper = ( {
	actionButton,
	children,
	ellipsisMenuItems,
	headerText,
	subHeaderText,
}: SubscriptionsManagerWrapperProps ) => {
	const translate = useTranslate();

	// Mark follows as stale on unmount to ensure that the reader
	// redux store is in a consistent state when the user navigates.
	// This is necessary because the subscription manager does not
	// sync its subscriptions state with the reader redux store.
	useMarkFollowsAsStaleOnUnmount();

	return (
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
			<Main className="site-subscriptions-manager">
				<DocumentHead title={ translate( 'Manage subscriptions' ) } />

				<HStack className="site-subscriptions-manager__header-h-stack">
					<FormattedHeader
						headerText={ headerText }
						subHeaderText={ subHeaderText }
						align="left"
						brandFont
					/>
					<Spacer />
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
				</HStack>

				{ children }
			</Main>
		</SubscriptionManagerContextProvider>
	);
};

export default SubscriptionsManagerWrapper;
