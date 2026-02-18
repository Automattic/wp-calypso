import { isEnabled } from '@automattic/calypso-config';
import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { useEffect } from 'react';
import {
	CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT,
	CONTACT_URL_HASH_FRAGMENT,
	CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT,
} from '../components/a4a-contact-support-widget';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

export default function useHelpCenter() {
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { setShowHelpCenter, setIsMinimized, setNavigateToRoute } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		if ( isMinimized ) {
			setIsMinimized( false );
		} else {
			setShowHelpCenter( ! show );
			setNavigateToRoute( '/' );
		}
	};

	const showSupportGuide = ( link: string ) => {
		setShowHelpCenter( true );
		setNavigateToRoute( '/post?link=' + encodeURIComponent( link ) );
	};

	useEffect( () => {
		// We support URL hash fragments for the contact support form.
		// When the hash changes, we need to check if it contains a support form hash fragment.
		// If it does, we need to set the show help center to true and set the navigate to route to the contact form.
		const handleHashChange = () => {
			const hasSupportFormHash =
				window.location.hash === CONTACT_URL_HASH_FRAGMENT ||
				window.location.hash === CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT ||
				window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT;

			if ( hasSupportFormHash && isEnabled( 'a4a-help-center' ) ) {
				const isMigrationRequest =
					window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT;

				setShowHelpCenter( true );
				setNavigateToRoute(
					isMigrationRequest ? '/contact-form?migration-request=1' : '/contact-form'
				);
				history.pushState( null, '', window.location.pathname + window.location.search );
			}
		};

		window.addEventListener( 'hashchange', handleHashChange );
		handleHashChange();

		return () => window.removeEventListener( 'hashchange', handleHashChange );
	}, [ setNavigateToRoute, setShowHelpCenter ] );

	return {
		toggleHelpCenter: handleToggleHelpCenter,
		showSupportGuide,
		show,
	};
}
