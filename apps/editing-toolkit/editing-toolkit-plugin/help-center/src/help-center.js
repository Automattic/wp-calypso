import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { useEffect, useState } from 'react';
import Contents from './contents';
import './help-center.scss';

function HelpCenterComponent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const { show, hasSeenWhatsNewModal, hasFetchedHasSeenWhatsNewModal } = useSelect( ( select ) => {
		const store = select( 'automattic/help-center' );
		return {
			show: store.isHelpCenterShown(),
			hasSeenWhatsNewModal: store.hasSeenWhatsNewModal(),
			hasFetchedHasSeenWhatsNewModal: store.hasFetchedHasSeenWhatsNewModal(),
		};
	} );
	const { setShowHelpCenter, fetchHasSeenWhatsNewModal } = useDispatch( 'automattic/help-center' );
	const [ selectedArticle, setSelectedArticle ] = useState( null );
	const [ footerContent, setFooterContent ] = useState( null );

	// On mount check if the Whats New Modal Seen status exists in state (from local storage), otherwise fetch it from the API.
	useEffect( () => {
		if ( ! hasFetchedHasSeenWhatsNewModal ) {
			fetchHasSeenWhatsNewModal();
		}
	}, [ hasFetchedHasSeenWhatsNewModal, fetchHasSeenWhatsNewModal ] );

	useEffect( () => {
		if ( ! show ) {
			setSelectedArticle( null );
		}
	}, [ show ] );

	return (
		<>
			{ isDesktop && (
				<PinnedItems scope="core/edit-post">
					<span className="etk-help-center">
						<Button
							className={ cx( 'entry-point-button', { 'is-active': show } ) }
							onClick={ () => setShowHelpCenter( ! show ) }
							icon={
								<HelpIcon
									newItems={ typeof hasSeenWhatsNewModal !== 'undefined' && ! hasSeenWhatsNewModal }
									active={ show }
								/>
							}
						></Button>
					</span>
				</PinnedItems>
			) }
			{ show && (
				<HelpCenter
					content={
						<Contents
							selectedArticle={ selectedArticle }
							setSelectedArticle={ setSelectedArticle }
							setFooterContent={ setFooterContent }
						/>
					}
					headerText={ selectedArticle?.title }
					handleClose={ () => setShowHelpCenter( false ) }
					footerContent={ footerContent }
				/>
			) }
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => <HelpCenterComponent />,
} );
