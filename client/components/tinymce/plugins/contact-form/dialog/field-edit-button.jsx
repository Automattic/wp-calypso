/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Popover from 'components/popover';

class ContactFormDialogFieldEditButton extends PureComponent {
	static propTypes = {
		expanded: PropTypes.bool.isRequired,
	};

	constructor() {
		super( ...arguments );
		this.state = { showTooltip: false };
		this.handleMouseEnter = this.handleMouseEnter.bind( this );
		this.handleMouseLeave = this.handleMouseLeave.bind( this );
	}

	handleMouseEnter() {
		this.setState( { showTooltip: true } );
	}

	handleMouseLeave() {
		this.setState( { showTooltip: false } );
	}

	render() {
		const { expanded, translate } = this.props;
		const classes = classNames( 'editor-contact-form-modal-field__edit', {
			'is-expanded': expanded,
		} );

		return (
			<div className="editor-contact-form-modal-field__edit-wrapper foldable-card__expand">
				<Button
					className="editor-contact-form-modal-field__edit-wrapper-button"
					ref="editField"
					borderless
					onMouseEnter={ this.handleMouseEnter }
					onMouseLeave={ this.handleMouseLeave }
				>
					<Gridicon icon="pencil" className={ classes } />
				</Button>
				<Popover
					isVisible={ this.state.showTooltip }
					context={ this.refs && this.refs.editField }
					onClose={ noop }
					position="bottom"
					className="popover tooltip is-dialog-visible"
				>
					{ translate( 'Edit Field', { context: 'button tooltip' } ) }
				</Popover>
			</div>
		);
	}
}

export default localize( ContactFormDialogFieldEditButton );
