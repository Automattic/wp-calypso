import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useLocalizeUrl } from '@automattic/i18n-utils';
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
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useAddSubscribersCallback, useMigrateSubscribersCallback } from '../../hooks';
import { AddSubscribersModal } from '../add-subscribers-modal';
import { MigrateSubscribersModal } from '../migrate-subscribers-modal';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';

import './style.scss';

enum SubscriberModalType {
	NONE = 'none',
	ADD = 'add',
	MIGRATE = 'migrate',
}

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
	const isWPCOMSite = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );

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

	/**
	 * The modals are handled from the header component to avoid
	 * complicated state management. The modal state exists in the
	 * same component where they are added and removed.
	 */
	const addSubscribersCallback = useAddSubscribersCallback( siteId );
	const migrateSubscribersCallback = useMigrateSubscribersCallback( siteId );
	const [ showSubscriberModal, setShowSubscriberModal ] = useState< SubscriberModalType >(
		SubscriberModalType.NONE
	);
	const closeSubscriberModal = () => {
		setShowSubscriberModal( SubscriberModalType.NONE );
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
					onClick={ () => setShowSubscriberModal( SubscriberModalType.ADD ) }
				>
					<Gridicon icon="plus" size={ 24 } />
					<span className="add-subscribers-button-text">{ translate( 'Add subscribers' ) }</span>
				</Button>
				<SubscribersHeaderPopover
					siteId={ selectedSiteId }
					openMigrateSubscribersModal={ () =>
						setShowSubscriberModal( SubscriberModalType.MIGRATE )
					}
				/>
			</NavigationHeader>
			{ siteId && (
				<AddSubscribersModal
					isVisible={ showSubscriberModal === SubscriberModalType.ADD }
					onClose={ closeSubscriberModal }
					addSubscribersCallback={ () => {
						closeSubscriberModal();
						addSubscribersCallback();
					} }
				/>
			) }
			{ siteId && (
				<MigrateSubscribersModal
					isVisible={ showSubscriberModal === SubscriberModalType.MIGRATE }
					onClose={ closeSubscriberModal }
					migrateSubscribersCallback={ ( selectedSourceSiteId ) => {
						closeSubscriberModal();
						migrateSubscribersCallback( selectedSourceSiteId );
					} }
				/>
			) }
		</>
	);
};
