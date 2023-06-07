import { recordTracksEvent } from '@automattic/calypso-analytics';
import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { LocaleProvider } from '@automattic/i18n-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { whatsNewQueryClient } from '../../common/what-new-query-client';
import CalypsoStateProvider from './CalypsoStateProvider';

// Implement PinnedItems to avoid importing @wordpress/interface.
// Because @wordpress/interface depends on @wordpress/preferences which is not always available outside the editor,
// causing the script to not be enqueued due to the missing dependency.
// check https://github.com/Automattic/wp-calypso/pull/74122 for more details.
function PinnedItems( { scope, ...props } ) {
	return <Fill name={ `PinnedItems/${ scope }` } { ...props } />;
}

function HelpCenterContent() {
	const [ helpIconRef, setHelpIconRef ] = useState();
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const sectionName = useSelector( getSectionName );
	const [ showHelpIcon, setShowHelpIcon ] = useState( false );
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	const show = useSelect( ( select ) => select( 'automattic/help-center' ).isHelpCenterShown() );

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ show ? 'close' : 'show' }`, {
			force_site_id: true,
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
					/>
				}
				label="Help"
				aria-pressed={ show ? true : false }
				aria-expanded={ show ? true : false }
			/>
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
