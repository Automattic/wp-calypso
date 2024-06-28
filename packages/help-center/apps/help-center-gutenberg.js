/* global helpCenterData */
import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import clsx from 'clsx';
import HelpCenter from '../src/components/help-center';
import HelpIcon from '../src/components/help-icon';
import useActionHooks from './use-action-hooks';
import './help-center.scss';

const queryClient = new QueryClient();

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
				locale={ helpCenterData.locale }
				sectionName="gutenberg-editor"
				currentUser={ helpCenterData.currentUser }
				site={ helpCenterData.site }
				hasPurchases={ false }
				onboardingUrl="https://wordpress.com/start"
				handleClose={ closeCallback }
			/>
		</>
	);
}

registerPlugin( 'jetpack-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ queryClient }>
				<HelpCenterContent />
			</QueryClientProvider>
		);
	},
} );
