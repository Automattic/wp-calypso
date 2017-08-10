var PropTypes = require('prop-types');
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	FormButton = require( 'components/forms/form-button' ),
	Gridicon = require( 'gridicons' );

module.exports = localize(class extends React.Component {
    static displayName = 'SecurityAccountRecoveryManageContactButtons';

	static propTypes = {
		isSavable: PropTypes.bool,
		isDeletable: PropTypes.bool,
		saveText: PropTypes.string,
		onSave: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onDelete: PropTypes.func.isRequired
	};

	render() {
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
});
