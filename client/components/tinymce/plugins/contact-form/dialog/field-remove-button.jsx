/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Popover from 'components/popover';

export default localize( React.createClass( {
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
					{ this.props.translate( 'Remove Field', { context: 'button tooltip' } ) }
				</Popover>
			</div>
		);
	}
} ) );
