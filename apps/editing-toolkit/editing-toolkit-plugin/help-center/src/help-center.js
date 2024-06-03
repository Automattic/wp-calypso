import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { LocaleProvider } from '@automattic/i18n-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';
import useActionHooks from './use-action-hooks';

function HelpCenterContent() {
	const [ helpIconRef, setHelpIconRef ] = useState();
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const sectionName = useSelector( getSectionName );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );

	const handleToggleHelpCenter = useCallback( () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		setShowHelpCenter( ! show );
	}, [ setShowHelpCenter, show ] );

	useEffect( () => {
		const timeout = setTimeout( () => setShowHelpIcon( true ), 0 );
		return () => clearTimeout( timeout );
	}, [] );

	useActionHooks();

	const closeCallback = useCallback( () => setShowHelpCenter( false ), [ setShowHelpCenter ] );

	const content = (
		<>
			<Button
				className={ clsx( 'entry-point-button', 'help-center', { 'is-active': show } ) }
				onClick={ handleToggleHelpCenter }
				icon={
					<HelpIcon
						ref={ ( ref ) => {
							if ( ref !== helpIconRef ) {
								setHelpIconRef( ref );
							}
						} }
					/>
				}
				label="Help"
				aria-pressed={ show ? true : false }
				aria-expanded={ show ? true : false }
				size="compact"
			/>
		</>
	);

	return (
		<>
			{ isDesktop && showHelpIcon && <Fill name="PinnedItems/core">{ content }</Fill> }
			<HelpCenter handleClose={ closeCallback } />
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ whatsNewQueryClient }>
				<CalypsoStateProvider>
					<LocaleProvider localeSlug={ window.helpCenterLocale?.locale }>
						<HelpCenterContent />
					</LocaleProvider>
				</CalypsoStateProvider>
			</QueryClientProvider>
		);
	},
} );
