/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { Button, IconButton, Icon } from '@wordpress/components';
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
					<div className="warning">
						{ /* TODO:  if we want to keep the icon it should be added to @automattic/material-design-icons */ }
						<Icon
							icon={
								<svg
									className="icon"
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
								>
									<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
								</svg>
							}
						/>
						<div className="message">
							{ sprintf( __( 'Changes published will update all pages using this %s.' ), title ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
