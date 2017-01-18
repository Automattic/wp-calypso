/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Popover from 'components/popover';

export default React.createClass( {
	displayName: 'ContactFormDialogFieldRemoveButton',

	mixins: [ PureRenderMixin ],

	propTypes: {
		onRemove: PropTypes.func.isRequired
	},

	getInitialState: function() {
		return {
			showTooltip: false
		};
	},

	render() {
		return (
			<div>
				<Button
					ref="removeField"
					borderless
					onMouseEnter={ () => this.setState( { showTooltip: true } ) }
					onMouseLeave={ () => this.setState( { showTooltip: false } ) }
					onClick={ this.props.onRemove }>
					<Gridicon icon="trash" className="editor-contact-form-modal-field__remove" />
				</Button>
				<Popover
					isVisible={ this.state.showTooltip }
					context={ this.refs && this.refs.removeField }
					onClose={ () => {} }
					position="bottom"
					className="popover tooltip is-dialog-visible">
					{ this.translate( 'Remove Field', { context: 'button tooltip' } ) }
				</Popover>
			</div>
		);
	}
} );
