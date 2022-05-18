import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { useEffect, useState } from 'react';
import { QueryClientProvider } from 'react-query';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import Contents from './contents';
import './help-center.scss';

function HelpCenterContent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );
	const [ showHelpIconDot, setShowHelpIconDot ] = useState( false );
	const { data, isLoading } = useHasSeenWhatsNewModalQuery( window._currentSiteId );
	useEffect( () => {
		if ( ! isLoading && data ) {
			setShowHelpIconDot( ! data.has_seen_whats_new_modal );
		}
	}, [ data, isLoading ] );

	const content = (
		<span className="etk-help-center">
			<Button
				className={ cx( 'entry-point-button', { 'is-active': show } ) }
				onClick={ () => setShowHelpCenter( ! show ) }
				icon={ <HelpIcon newItems={ showHelpIconDot } active={ show } /> }
			></Button>
		</span>
	);

	return (
		<>
			{ isDesktop && (
				<>
					<PinnedItems scope="core/edit-post">{ content }</PinnedItems>
					<PinnedItems scope="core/edit-site">{ content }</PinnedItems>
					<PinnedItems scope="core/edit-widgets">{ content }</PinnedItems>
				</>
			) }
			{ show && (
				<HelpCenter
					content={ <Contents handleClose={ () => setShowHelpCenter( false ) } /> }
					handleClose={ () => setShowHelpCenter( false ) }
				/>
			) }
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ whatsNewQueryClient }>
				<HelpCenterContent />,
			</QueryClientProvider>
		);
	},
} );
