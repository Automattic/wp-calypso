/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Button, IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default class Panel extends Component {
	render() {
		const { onSave, onClose, isBusy, disabled } = this.props;
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
						<p>{ __( 'Changes you publish will update all pages with this template part.' ) }</p>
					</div>
				</div>
			</div>
		);
	}
}
