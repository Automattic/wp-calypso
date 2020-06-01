/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import isConvertToBlocksDialogDismissed from 'state/selectors/is-convert-to-blocks-dialog-dismissed';
import { dismissConvertToBlocksDialog } from 'state/ui/convert-to-blocks-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
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

	if ( isDismissed ) {
		return null;
	}

	const onClose = ( action ) => {
		handleResponse( action === 'convert' );
		dispatch( dismissConvertToBlocksDialog( siteId, postId ) );
	};

	const buttons = [
		{
			action: 'convert',
			isPrimary: true,
			label: translate( 'Convert to Blocks' ),
		},
		{
			action: 'cancel',
			label: translate( 'Stick with the Classic Block' ),
		},
	];

	return (
		<Dialog
			additionalClassNames="editor__gutenberg-convert-blocks-dialog"
			buttons={ buttons }
			isVisible={ showDialog }
			onClose={ onClose }
		>
			<h1>{ translate( 'Convert to blocks?' ) }</h1>
			<p>
				{ translate(
					'This post contains content you created with the classic editor. You can convert this content into blocks — each paragraph and item will be its own block, that you can edit and move around — or add a Classic block to simulate the classic editor.'
				) }
			</p>
		</Dialog>
	);
}
