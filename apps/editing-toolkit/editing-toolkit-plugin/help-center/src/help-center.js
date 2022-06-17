import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { QueryClientProvider } from 'react-query';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';
import './help-center.scss';

function HelpCenterContent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );
	const [ showHelpIconDot, setShowHelpIconDot ] = useState( false );
	const { data, isLoading } = useHasSeenWhatsNewModalQuery( window._currentSiteId );
	useEffect( () => {
		if ( ! isLoading && data ) {
			setShowHelpIconDot( ! data.has_seen_whats_new_modal );
		}
	}, [ data, isLoading ] );

	const handleToggleHelpCenter = () => {
		if ( show ) {
			recordTracksEvent( 'calypso_inlinehelp_close', { location: 'help-center-desktop' } );
		} else {
			recordTracksEvent( 'calypso_inlinehelp_show', { location: 'help-center-desktop' } );
		}
		setShowHelpCenter( ! show );
	};

	useEffect( () => {
		const timeout = setTimeout( () => setShowHelpIcon( true ), 0 );
		return () => clearTimeout( timeout );
	}, [] );

	const content = (
		<span className="etk-help-center">
			<Button
				className={ cx( 'entry-point-button', { 'is-active': show } ) }
				onClick={ handleToggleHelpCenter }
				icon={ <HelpIcon newItems={ showHelpIconDot } /> }
			></Button>
		</span>
	);

	return (
		<>
			{ isDesktop && showHelpIcon && (
				<>
					<PinnedItems scope="core/edit-post">{ content }</PinnedItems>
					<PinnedItems scope="core/edit-site">{ content }</PinnedItems>
					<PinnedItems scope="core/edit-widgets">{ content }</PinnedItems>
				</>
			) }
			{ show && <HelpCenter handleClose={ () => setShowHelpCenter( false ) } /> }
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ whatsNewQueryClient }>
				<CalypsoStateProvider>
					<HelpCenterContent />
				</CalypsoStateProvider>
			</QueryClientProvider>
		);
	},
} );
