import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { HelpCenter, Subscriber as SubscriberDataStore } from '@automattic/data-stores';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SubscriberValidationGate from 'calypso/components/subscribers-validation-gate';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import GiftSubscriptionModal from 'calypso/my-sites/subscribers/components/gift-modal/gift-modal';
import { SubscriberDataViews } from 'calypso/my-sites/subscribers/components/subscriber-data-views';
import { SubscriberListContainer } from 'calypso/my-sites/subscribers/components/subscriber-list-container';
import {
	SubscribersPageProvider,
	useSubscribersPage,
} from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { AddSubscribersModal } from './components/add-subscribers-modal';
import { MigrateSubscribersModal } from './components/migrate-subscribers-modal';
import { SubscribersHeaderPopover } from './components/subscribers-header-popover';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { SubscribersFilterBy, SubscribersSortBy } from './constants';
import { getSubscriberDetailsUrl } from './helpers';
import { useUnsubscribeModal } from './hooks';
import { Subscriber } from './types';
import './style.scss';

type SubscribersHeaderProps = {
	selectedSiteId: number | undefined;
	disableCta: boolean;
};

const HELP_CENTER_STORE = HelpCenter.register();

const SubscribersHeader = ( { selectedSiteId, disableCta }: SubscribersHeaderProps ) => {
	const { setShowAddSubscribersModal } = useSubscribersPage();
	const localizeUrl = useLocalizeUrl();
	const { setShowHelpCenter, setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID || null;
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );

	const openHelpCenter = () => {
		setShowHelpCenter( true );
		setShowSupportDoc( localizeUrl( 'https://wordpress.com/support/paid-newsletters/' ), 168381 );
	};

	const paidNewsletterUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/newsletter/paid-newsletters/'
		: 'https://wordpress.com/support/paid-newsletters/';

	const subtitleOptions = {
		components: {
			link: (
				<a
					href={ localizeUrl( paidNewsletterUrl ) }
					target="blank"
					onClick={ ( event ) => {
						if ( ! isJetpackCloud() ) {
							event.preventDefault();
							openHelpCenter();
						}
					} }
					rel="noreferrer"
				/>
			),
		},
	};

	return (
		<NavigationHeader
			className="stats__section-header modernized-header"
			title={ translate( 'Subscribers' ) }
			subtitle={ translate(
				'Add subscribers to your site and send them a free or {{link}}paid newsletter{{/link}}.',
				subtitleOptions
			) }
			screenReader={ navItems.insights?.label }
			navigationItems={ [] }
		>
			<Button
				className="add-subscribers-button"
				primary
				disabled={ disableCta }
				onClick={ () => setShowAddSubscribersModal( true ) }
			>
				<Gridicon icon="plus" size={ 24 } />
				<span className="add-subscribers-button-text">{ translate( 'Add subscribers' ) }</span>
			</Button>
			<SubscribersHeaderPopover siteId={ selectedSiteId } />
		</NavigationHeader>
	);
};

type SubscribersProps = {
	filterOption: SubscribersFilterBy;
	pageNumber: number;
	timestamp: number;
	searchTerm: string;
	sortTerm: SubscribersSortBy;
	filterOptionChanged: ( option: SubscribersFilterBy ) => void;
	pageChanged: ( page: number ) => void;
	searchTermChanged: ( term: string ) => void;
	sortTermChanged: ( term: SubscribersSortBy ) => void;
	reloadData: () => void;
};

const SubscribersPage = ( {
	filterOption,
	pageNumber,
	searchTerm,
	sortTerm,
	timestamp,
	filterOptionChanged,
	pageChanged,
	searchTermChanged,
	sortTermChanged,
	reloadData,
}: SubscribersProps ) => {
	const selectedSite = useSelector( getSelectedSite );

	const [ giftUserId, setGiftUserId ] = useState( 0 );
	const [ giftUsername, setGiftUsername ] = useState( '' );

	const siteId = selectedSite?.ID || null;

	const pageArgs = {
		currentPage: pageNumber,
		filterOption,
		searchTerm,
		sortTerm,
	};

	const importSelector = useSelect(
		( select ) => select( SubscriberDataStore.store ).getImportSubscribersSelector(),
		[]
	);

	const isUnverified = importSelector?.error?.code === 'unverified_email';
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	const { getSubscribersImports } = useDataStoreDispatch( SubscriberDataStore.store );

	useEffect( () => {
		if ( siteId ) {
			getSubscribersImports( siteId );
		}
	}, [ siteId, getSubscribersImports ] );

	const { currentSubscriber, onClickUnsubscribe, onConfirmModal, resetSubscriber } =
		useUnsubscribeModal( selectedSite?.ID ?? null, pageArgs );
	const onClickView = ( { subscription_id, user_id }: Subscriber ) => {
		page.show( getSubscriberDetailsUrl( selectedSite?.slug, subscription_id, user_id, pageArgs ) );
	};

	const onGiftSubscription = ( { user_id, display_name }: Subscriber ) => {
		setGiftUserId( user_id );
		setGiftUsername( display_name );
	};

	return (
		<SubscribersPageProvider
			siteId={ siteId }
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
			timestamp={ timestamp }
			filterOptionChanged={ filterOptionChanged }
			pageChanged={ pageChanged }
			searchTermChanged={ searchTermChanged }
			sortTermChanged={ sortTermChanged }
		>
			<QueryMembershipsSettings siteId={ siteId ?? 0 } source="calypso" />
			<Main wideLayout className="subscribers">
				<DocumentHead title={ translate( 'Subscribers' ) } />

				{ ! isEnabled( 'subscribers-dataviews' ) && (
					<SubscribersHeader
						selectedSiteId={ selectedSite?.ID }
						disableCta={ isUnverified || isStagingSite }
					/>
				) }
				<SubscriberValidationGate siteId={ siteId }>
					{ isEnabled( 'subscribers-dataviews' ) ? (
						// Your new dataviews component
						<SubscriberDataViews
							siteId={ selectedSite?.ID }
							onGiftSubscription={ onGiftSubscription }
							isUnverified={ isUnverified }
							isStagingSite={ isStagingSite }
						/>
					) : (
						// Existing subscriber list
						<SubscriberListContainer
							siteId={ siteId }
							onClickView={ onClickView }
							onGiftSubscription={ onGiftSubscription }
							onClickUnsubscribe={ onClickUnsubscribe }
						/>
					) }

					<UnsubscribeModal
						subscriber={ currentSubscriber }
						onCancel={ resetSubscriber }
						onConfirm={ onConfirmModal }
					/>

					{ giftUserId !== 0 && (
						<GiftSubscriptionModal
							siteId={ selectedSite?.ID ?? 0 }
							userId={ giftUserId }
							username={ giftUsername }
							onCancel={ () => setGiftUserId( 0 ) }
							onConfirm={ function () {
								setGiftUserId( 0 );
								reloadData();
							} }
						/>
					) }
					{ selectedSite && <AddSubscribersModal site={ selectedSite } /> }
					{ selectedSite && <MigrateSubscribersModal /> }
				</SubscriberValidationGate>
			</Main>
		</SubscribersPageProvider>
	);
};

export default SubscribersPage;
