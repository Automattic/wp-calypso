import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './reader-sidebar-collapse-toggle.scss';

export default function ReaderSidebarCollapseToggle() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isCollapsed = useSelector( ( state ) => getPreference( state, 'readerSidebarCollapsed' ) );

	useEffect( () => {
		document.body.classList.toggle( 'is-reader-sidebar-collapsed', !! isCollapsed );
		return () => {
			document.body.classList.remove( 'is-reader-sidebar-collapsed' );
		};
	}, [ isCollapsed ] );

	const handleToggle = () => {
		dispatch( recordTracksEvent( 'calypso_reader_sidebar_toggle', { collapsed: ! isCollapsed } ) );
		dispatch( savePreference( 'readerSidebarCollapsed', ! isCollapsed ) );
	};

	return (
		<Button
			className="reader-sidebar-collapse-toggle"
			onClick={ handleToggle }
			icon={ isCollapsed ? chevronRight : chevronLeft }
			label={ isCollapsed ? translate( 'Expand sidebar' ) : translate( 'Collapse sidebar' ) }
			size="compact"
		/>
	);
}
