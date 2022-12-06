import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon, PromotionalPopover } from '@automattic/help-center';
import { LocaleProvider } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';

function HelpCenterContent() {
	const [ helpIconRef, setHelpIconRef ] = useState();
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const sectionName = useSelector( getSectionName );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const { show, hasSeenWhatsNewModal } = useSelect( ( select ) => ( {
		show: select( 'automattic/help-center' ).isHelpCenterShown(),
		hasSeenWhatsNewModal: select( 'automattic/help-center' ).getHasSeenWhatsNewModal(),
	} ) );

	const showHelpIconDot = hasSeenWhatsNewModal !== undefined && ! hasSeenWhatsNewModal;

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			forceSiteId: true,
			location: 'help-center',
			section: sectionName,
		} );

		setShowHelpCenter( ! show );
	};

	useEffect( () => {
		const timeout = setTimeout( () => setShowHelpIcon( true ), 0 );
		return () => clearTimeout( timeout );
	}, [] );

	const content = (
		<>
			<Button
				className={ cx( 'entry-point-button', 'help-center', { 'is-active': show } ) }
				onClick={ handleToggleHelpCenter }
				icon={
					<HelpIcon
						ref={ ( ref ) => {
							if ( ref !== helpIconRef ) {
								setHelpIconRef( ref );
							}
						} }
						newItems={ showHelpIconDot }
					/>
				}
				label="Help"
				aria-pressed={ show ? true : false }
				aria-expanded={ show ? true : false }
			/>
			<PromotionalPopover iconElement={ helpIconRef } />
		</>
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
			<HelpCenter handleClose={ () => setShowHelpCenter( false ) } />
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => {
		return (
			<QueryClientProvider client={ whatsNewQueryClient }>
				<CalypsoStateProvider>
					<LocaleProvider localeSlug={ window.helpCenterLocale }>
						<HelpCenterContent />
					</LocaleProvider>
				</CalypsoStateProvider>
			</QueryClientProvider>
		);
	},
} );
