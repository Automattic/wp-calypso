import { Gridicon } from '@automattic/components';
import { HelpCenter, updateLaunchpadSettings } from '@automattic/data-stores';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import NavigationHeader from 'calypso/components/navigation-header';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useAddSubscribersCallback, useMigrateSubscribersCallback } from '../../hooks';
import { AddSubscribersModal } from '../add-subscribers-modal';
import { MigrateSubscribersModal } from '../migrate-subscribers-modal';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';

import './style.scss';

type SubscribersHeaderProps = {
	selectedSiteId: number | undefined;
	disableCta: boolean;
	hideSubtitle?: boolean;
};

const HELP_CENTER_STORE = HelpCenter.register();

export const SubscribersHeader = ( {
	selectedSiteId,
	disableCta,
	hideSubtitle,
}: SubscribersHeaderProps ): ReactElement => {
	const localizeUrl = useLocalizeUrl();
	const { setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );
	const siteId = useSelector( getSelectedSiteId ) ?? null;
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const addSubscribersCallback = useAddSubscribersCallback( siteId );
	const migrateSubscribersCallback = useMigrateSubscribersCallback();
	const [ showSubscriberModal, setShowSubscriberModal ] = useState< 'none' | 'add' | 'migrate' >(
		'none'
	);

	const queryClient = useQueryClient();
	const completeImportSubscribersTask = async () => {
		if ( selectedSiteSlug ) {
			await updateLaunchpadSettings( selectedSiteSlug, {
				checklist_statuses: { import_subscribers: true },
			} );
		}
		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
	};

	const openHelpCenter = () => {
		setShowSupportDoc( localizeUrl( 'https://wordpress.com/support/paid-newsletters/' ) );
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

	const closeSubscriberModal = () => {
		setShowSubscriberModal( 'none' );
	};

	return (
		<>
			<NavigationHeader
				className="subscribers__header"
				title={ translate( 'Subscribers' ) }
				subtitle={
					hideSubtitle
						? null
						: translate(
								'Add subscribers to your site and send them a free or {{link}}paid newsletter{{/link}}.',
								subtitleOptions
						  )
				}
				screenReader={ navItems.insights?.label }
				navigationItems={ [] }
			>
				<Button
					variant="primary"
					className="button add-subscribers-button"
					disabled={ disableCta }
					onClick={ () => setShowSubscriberModal( 'add' ) }
				>
					<Gridicon icon="plus" size={ 24 } />
					<span className="add-subscribers-button-text">{ translate( 'Add subscribers' ) }</span>
				</Button>
				<SubscribersHeaderPopover
					siteId={ selectedSiteId }
					openMigrateSubscribersModal={ () => setShowSubscriberModal( 'migrate' ) }
				/>
			</NavigationHeader>
			{ siteId && (
				<AddSubscribersModal
					isVisible={ showSubscriberModal === 'add' }
					onClose={ closeSubscriberModal }
					addSubscribersCallback={ ( importError ) => {
						completeImportSubscribersTask();
						addSubscribersCallback( importError );
					} }
				/>
			) }
			{ siteId && (
				<MigrateSubscribersModal
					isVisible={ showSubscriberModal === 'migrate' }
					onClose={ closeSubscriberModal }
					migrateSubscribersCallback={ ( selectedSourceSiteId, targetSiteId ) => {
						completeImportSubscribersTask();
						migrateSubscribersCallback( selectedSourceSiteId, targetSiteId );
					} }
				/>
			) }
		</>
	);
};
