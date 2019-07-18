/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { Button, IconButton, Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';

export default ( { onSave, onClose, isBusy, disabled } ) => {
	const { title } = useSelect( select => {
		return select( 'core/editor' ).getCurrentPost();
	} );
	return (
		<div className="edit-post-layout">
			<div className="editor-post-publish-panel">
				<div className="editor-post-publish-panel__header">
					<div className="editor-post-publish-panel__header-publish-button">
						<Button isPrimary isLarge isBusy={ isBusy } onClick={ onSave } disabled={ disabled }>
							{ __( 'Publish' ) }
						</Button>
						<span className="editor-post-publish-panel__spacer" />
					</div>

					<IconButton
						aria-expanded={ true }
						onClick={ onClose }
						icon="no-alt"
						label={ __( 'Close panel' ) }
					/>
				</div>
				<div className="editor-post-publish-panel__prepublish">
					<p>
						<strong>{ __( 'Are you ready to publish?' ) }</strong>
					</p>
					<Notice status="warning" isDismissible={ false }>
						{ sprintf( __( 'Changes published will update all pages using this %s.' ), title ) }
					</Notice>
				</div>
			</div>
		</div>
	);
};
