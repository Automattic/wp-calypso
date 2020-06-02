/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * WordPress dependencies
 */
import { Button, Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import isConvertToBlocksDialogDismissed from 'state/selectors/is-convert-to-blocks-dialog-dismissed';
import { dismissConvertToBlocksDialog } from 'state/ui/convert-to-blocks-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import '@wordpress/components/build-style/style.css';
import './style.scss';

export default function ConvertToBlocksDialog( { handleResponse, postId, showDialog } ) {
	const { isDismissed, siteId } = useSelector( ( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			isDismissed: isConvertToBlocksDialogDismissed( state, selectedSiteId, postId ),
			siteId: selectedSiteId,
		};
	} );
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( ! showDialog || isDismissed ) {
		return null;
	}

	const onClose = ( action ) => () => {
		handleResponse( action === 'convert' );
		dispatch( dismissConvertToBlocksDialog( siteId, postId ) );
	};

	return (
		<Modal
			onRequestClose={ onClose( 'cancel' ) }
			shouldCloseOnClickOutside={ false }
			title={ translate( 'Convert to blocks?' ) }
		>
			<p>
				{ translate(
					'This post contains content you created with the classic editor. You can convert this content into blocks — each paragraph and item will be its own block that you can edit and move around — or add a Classic block to simulate the classic editor.'
				) }
			</p>
			<div className="convert-to-blocks__dialog-actions">
				<Button onClick={ onClose( 'convert' ) } isPrimary>
					{ translate( 'Convert to Blocks' ) }
				</Button>
				<Button onClick={ onClose( 'cancel' ) }>
					{ translate( 'Stick with the Classic Block' ) }
				</Button>
			</div>
		</Modal>
	);
}
