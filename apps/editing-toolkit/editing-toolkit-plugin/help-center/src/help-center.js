import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { QueryClientProvider } from '@tanstack/react-query';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import clsx from 'clsx';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import useActionHooks from './use-action-hooks';

function HelpCenterContent() {
	const [ helpIconRef, setHelpIconRef ] = useState();
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );

	const handleToggleHelpCenter = useCallback( () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: 'gutenberg-editor',
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
			<HelpCenter
				adminUrl={ window.helpCenterData.adminUrl }
				isJetpackSite={ window.helpCenterData.currentSite.jetpack }
				locale={ window.helpCenterData.locale }
				sectionName="gutenberg-editor"
				currentUserId={ window.helpCenterData.currentUserId }
				selectedSiteId={ window.helpCenterData.current }
				avatarUrl={ window.helpCenterData.avatarUrl }
				displayName={ window.helpCenterData.displayName }
				userEmail={ window.helpCenterData.userEmail }
				hasPurchases={ false }
				primarySiteId={ window.helpCenterData.primarySiteId }
				handleClose={ closeCallback }
				onboardingUrl="https://wordpress.com/start?ref=calypso-inline-help"
			/>
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ whatsNewQueryClient }>
				<HelpCenterContent />
			</QueryClientProvider>
		);
	},
} );
