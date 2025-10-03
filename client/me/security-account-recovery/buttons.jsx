import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';

class SecurityAccountRecoveryManageContactButtons extends Component {
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

				{ this.props.isDeletable && this.props.onDelete ? (
					<FormButton isPrimary={ false } scary onClick={ this.props.onDelete }>
						{ this.props.translate( 'Remove' ) }
					</FormButton>
				) : null }

				{ this.props.onCancel ? (
					<FormButton isPrimary={ false } onClick={ this.props.onCancel }>
						{ this.props.translate( 'Cancel' ) }
					</FormButton>
				) : null }
			</div>
		);
	}
}

export default localize( SecurityAccountRecoveryManageContactButtons );
