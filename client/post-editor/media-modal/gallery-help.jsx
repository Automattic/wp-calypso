/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isMobile } from 'lib/viewport';
import Popover from 'components/popover';
import Gridicon from 'components/gridicon';
import FormCheckbox from 'components/forms/form-checkbox';
import Button from 'components/button';

import { setPreference, savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import QueryPreferences from 'components/data/query-preferences';

const EditorMediaModalGalleryHelp =  React.createClass( {
	displayName: 'EditorMediaModalGalleryHelp',

	mixins: [ PureRenderMixin ],

	propTypes: {
		onDismiss: PropTypes.func
	},

	getInitialState() {
		return {
			isDismissed: false,
			rememberDismiss: true
		};
	},

	getDefaultProps() {
		return {
			onDismiss: () => {}
		};
	},

	setRenderContext( renderContext ) {
		if ( ! renderContext ) {
			return;
		}

		this.setState( { renderContext } );
	},

	toggleRememberDismiss() {
		// This is a bit of ugly interoperability between the way React treats
		// checkbox events and the media modal handler for preventing the modal
		// from closing when clicking a popover.
		//
		// See: https://facebook.github.io/react/docs/forms.html#potential-issues-with-checkboxes-and-radio-buttons
		// See: EditorMediaModal.preventPopoverClose()
		setTimeout( () => {
			this.setState( {
				rememberDismiss: ! this.state.rememberDismiss
			} );
		}, 0 );
	},

	dismiss( { remember } = {} ) {
		this.setState( { isDismissed: true } );
		this.props.onDismiss( { remember } );
	},

	renderPopover() {
		const { renderContext, isDismissed } = this.state;
		if ( ! renderContext || isDismissed ) {
			return;
		}

		return (
			<Popover
				onClose={ () => this.dismiss() }
				context={ renderContext }
				position="bottom"
				isVisible={ ! isMobile() }
				className="popover is-dialog-visible">
				<div className="editor-media-modal__gallery-help-content">
					<div className="editor-media-modal__gallery-help-instruction">
						<span className="editor-media-modal__gallery-help-icon">
							<Gridicon icon="image-multiple" size={ 20 } />
						</span>
						<span className="editor-media-modal__gallery-help-text">
							{ this.translate( 'Select more than one image to create a gallery.' ) }
						</span>
					</div>
					<div className="editor-media-modal__gallery-help-actions">
						<label className="editor-media-modal__gallery-help-remember-dismiss">
							<FormCheckbox checked={ this.state.rememberDismiss } onChange={ this.toggleRememberDismiss } />
							<span onClick={ this.toggleRememberDismiss }>
								{ this.translate( 'Don\'t show again' ) }
							</span>
						</label>
						<Button onClick={ () => this.dismiss( { remember: this.state.rememberDismiss } ) } compact>
							{ this.translate( 'Got it', { context: 'Button label', comment: 'User clicks this to confirm that he has understood the text' } ) }
						</Button>
					</div>
				</div>
			</Popover>
		);
	},

	render() {
		if ( this.props.isMediaModalGalleryInstructionsDismissed ) {
			return null;
		}
		return (
			<div ref={ this.setRenderContext } className="editor-media-modal__gallery-help">
				<QueryPreferences />
				{ this.renderPopover() }
			</div>
		);
	}
} );

export default connect(
	state => ( {
		isMediaModalGalleryInstructionsDismissed: (
			getPreference( state, 'mediaModalGalleryInstructionsDismissed' ) ||
			getPreference( state, 'mediaModalGalleryInstructionsDismissedForSession' )
		)
	} ),
	dispatch => bindActionCreators( {
		onDismiss: options => {
			if ( options.remember ) {
				return savePreference( 'mediaModalGalleryInstructionsDismissed', true );
			} else {
				return setPreference( 'mediaModalGalleryInstructionsDismissedForSession', true );
			}
		}
	}, dispatch )
)( EditorMediaModalGalleryHelp );

