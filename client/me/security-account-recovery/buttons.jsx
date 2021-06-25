/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FormButton from 'calypso/components/forms/form-button';
import Gridicon from 'calypso/components/gridicon';

class SecurityAccountRecoveryManageContactButtons extends React.Component {
	static displayName = 'SecurityAccountRecoveryManageContactButtons';

	static propTypes = {
		isSavable: PropTypes.bool,
		isDeletable: PropTypes.bool,
		saveText: PropTypes.string,
		onSave: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onDelete: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div>
				<FormButton disabled={ ! this.props.isSavable } onClick={ this.props.onSave }>
					{ this.props.saveText ? this.props.saveText : this.props.translate( 'Save' ) }
				</FormButton>

				<FormButton isPrimary={ false } onClick={ this.props.onCancel }>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>

				{ this.props.isDeletable ? (
					<button className="security-account-recovery__remove" onClick={ this.props.onDelete }>
						<Gridicon icon="trash" size={ 24 } />
						<span>{ this.props.translate( 'Remove' ) }</span>
					</button>
				) : null }
			</div>
		);
	}
}

export default localize( SecurityAccountRecoveryManageContactButtons );
