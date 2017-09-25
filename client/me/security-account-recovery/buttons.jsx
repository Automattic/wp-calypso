/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButtonsBar from 'components/forms/form-buttons-bar';

import FormButton from 'components/forms/form-button';
import Gridicon from 'gridicons';

export default localize( React.createClass( {
	displayName: 'SecurityAccountRecoveryManageContactButtons',

	propTypes: {
		isSavable: React.PropTypes.bool,
		isDeletable: React.PropTypes.bool,
		saveText: React.PropTypes.string,
		onSave: React.PropTypes.func.isRequired,
		onCancel: React.PropTypes.func.isRequired,
		onDelete: React.PropTypes.func.isRequired
	},

	render: function() {
		return (
		    <FormButtonsBar>
				<FormButton
					disabled={ ! this.props.isSavable }
					onClick={ this.props.onSave }>
					{ this.props.saveText ? this.props.saveText : this.props.translate( 'Save' ) }
				</FormButton>

				<FormButton
					isPrimary={ false }
					onClick={ this.props.onCancel }
					>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>

				{
					this.props.isDeletable
					? (
						<button className={ 'security-account-recovery-contact__remove' } onClick={ this.props.onDelete }>
							<Gridicon icon="trash" size={ 24 } />
							<span>{ this.props.translate( 'Remove' ) }</span>
						</button>
					)
					: null
				}
			</FormButtonsBar>
		);
	}
} ) );
