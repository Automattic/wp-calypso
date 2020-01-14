/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { Gridicon, Button } from '@automattic/components';

import Popover from 'components/popover';

class ContactFormDialogFieldRemoveButton extends React.PureComponent {
	static displayName = 'ContactFormDialogFieldRemoveButton';

	static propTypes = {
		onRemove: PropTypes.func.isRequired,
	};

	state = {
		showTooltip: false,
	};

	render() {
		return (
			<div>
				<Button
					ref="removeField"
					borderless
					onMouseEnter={ () => this.setState( { showTooltip: true } ) }
					onMouseLeave={ () => this.setState( { showTooltip: false } ) }
					onClick={ this.props.onRemove }
				>
					<Gridicon icon="trash" className="editor-contact-form-modal-field__remove" />
				</Button>
				<Popover
					isVisible={ this.state.showTooltip }
					context={ this.refs && this.refs.removeField }
					onClose={ () => {} }
					position="bottom"
					className="popover tooltip is-dialog-visible"
				>
					{ this.props.translate( 'Remove Field', { context: 'button tooltip' } ) }
				</Popover>
			</div>
		);
	}
}

export default localize( ContactFormDialogFieldRemoveButton );
