import { useLocale } from '@automattic/i18n-utils';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_SUBSCRIPTIONS } from 'calypso/blocks/reader-export-button/constants';
import ReaderImportButton from 'calypso/blocks/reader-import-button';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { AddSitesButton } from 'calypso/landing/subscriptions/components/add-sites-button';
import {
	SubscriptionsPortal,
	SubscriptionManagerContextProvider,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { SubscriptionsEllipsisMenu } from 'calypso/landing/subscriptions/components/subscriptions-ellipsis-menu';
import { downloadCloud, uploadCloud } from 'calypso/reader/icons';
import { useDispatch } from 'calypso/state';
import { markFollowsAsStale } from 'calypso/state/reader/follows/actions';
import ReaderSiteSubscriptions from './reader-site-subscriptions';
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

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();
	const locale = useLocale();
	const { hasTranslation } = useI18n();

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
						headerText={ translate( 'Manage subscribed sites' ) }
						subHeaderText={
							locale.startsWith( 'en' ) ||
							hasTranslation( 'Manage your site, RSS, and newsletter subscriptions.' )
								? translate( 'Manage your site, RSS, and newsletter subscriptions.' )
								: translate( 'Manage your newsletter and blog subscriptions.' )
						}
						align="left"
					/>
					<Spacer />
					<AddSitesButton />

					<SubscriptionsEllipsisMenu
						toggleTitle={ translate( 'More' ) }
						popoverClassName="site-subscriptions-manager__import-export-popover"
						verticalToggle
					>
						<VStack spacing={ 1 }>
							<ReaderImportButton icon={ uploadCloud } iconSize={ 20 } />
							<ReaderExportButton
								icon={ downloadCloud }
								iconSize={ 20 }
								exportType={ READER_EXPORT_TYPE_SUBSCRIPTIONS }
							/>
						</VStack>
					</SubscriptionsEllipsisMenu>
				</HStack>

				<ReaderSiteSubscriptions />
			</Main>
		</SubscriptionManagerContextProvider>
	);
};

export default SiteSubscriptionsManager;
