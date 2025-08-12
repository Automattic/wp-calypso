import { HelpCenter } from '@automattic/data-stores';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Button, Icon } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { plus } from '@wordpress/icons';
import { translate, fixMe } from 'i18n-calypso';
import { useEffect } from 'react';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import NavigationHeader from 'calypso/components/navigation-header';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import isSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { useAddSubscribersCallback, useMigrateSubscribersCallback } from '../../hooks';
import { AddSubscribersModal } from '../add-subscribers-modal';
import { MigrateSubscribersModal } from '../migrate-subscribers-modal';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';

enum SubscriberModalType {
	NONE = 'none',
	ADD = 'add',
	MIGRATE = 'migrate',
}

type SubscribersHeaderProps = {
	siteId: number | null;
	disableCta: boolean;
	hideSubtitle?: boolean;
	hideAddButtonLabel?: boolean;
};

const HELP_CENTER_STORE = HelpCenter.register();

export const SubscribersHeader = ( {
	siteId,
	disableCta,
	hideSubtitle,
	hideAddButtonLabel = false,
}: SubscribersHeaderProps ) => {
	const localizeUrl = useLocalizeUrl();
	const { setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );
	const isWPCOMSite = useSelector( ( state ) => isSiteWPCOM( state, siteId ) );
	const supportUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/newsletter/customize-the-newsletter-experience/#manage-subscribers'
		: 'https://wordpress.com/support/subscribers/ ';

	const openHelpCenter = () => {
		setShowSupportDoc( localizeUrl( supportUrl ) );
	};

	const subtitleOptions = {
		components: {
			link: (
				<a
					href={ localizeUrl( supportUrl ) }
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
	const [ initialMethod, setInitialMethod ] = useState( '' );
	const closeSubscriberModal = () => {
		setShowSubscriberModal( SubscriberModalType.NONE );
		setInitialMethod( '' );

		if ( window.location.hash.startsWith( '#add-subscribers' ) ) {
			// Doing this instead of window.location.hash = '' because window.location.hash keeps the # symbol
			// Also this makes the back button show the modal again, which is neat
			history.pushState( '', document.title, window.location.pathname + window.location.search );
		}
	};

	useEffect( () => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if ( hash.startsWith( '#add-subscribers' ) ) {
				const method = new URLSearchParams( hash.replace( '#add-subscribers', '' ) ).get(
					'method'
				);
				setShowSubscriberModal( SubscriberModalType.ADD );
				if ( method ) {
					setInitialMethod( method );
				}
			}
		};

		window.addEventListener( 'hashchange', handleHashChange );
		handleHashChange();

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	return (
		<>
			<NavigationHeader
				className="subscribers__header"
				title={ translate( 'Subscribers' ) }
				subtitle={
					hideSubtitle
						? null
						: fixMe( {
								text: 'Add subscribers to your site and filter your audience list. {{link}}Learn more{{/link}}.',
								newCopy: translate(
									'Add subscribers to your site and filter your audience list. {{link}}Learn more{{/link}}.',
									subtitleOptions
								),
								oldCopy: translate(
									'Add subscribers to your site and send them a free or {{link}}paid newsletter{{/link}}.',
									subtitleOptions
								),
						  } )
				}
				screenReader={ navItems.insights?.label }
				navigationItems={ [] }
			>
				<Button
					variant="primary"
					disabled={ disableCta }
					onClick={ () => setShowSubscriberModal( SubscriberModalType.ADD ) }
					size="compact"
					icon={ <Icon icon={ plus } size={ 18 } /> }
					{ ...{ [ hideAddButtonLabel ? 'label' : 'text' ]: translate( 'Add subscribers' ) } }
				/>
				<SubscribersHeaderPopover
					siteId={ siteId }
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
					initialMethod={ initialMethod }
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
