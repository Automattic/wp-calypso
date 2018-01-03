/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';

/**
 * Internal Dependencies
 */
import Dialog from 'components/dialog';
import FormTextInput from 'components/forms/form-text-input';

class RenameSiteConfirmationDialog extends PureComponent {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		onConfirm: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onConfirm: noop,
	};

	state = {
		confirmationTypedCorrectly: false,
		confirmationValue: '',
	};

	onConfirmChange = event => {
		const confirmationValue = get( event, 'target.value' );
		const confirmationTypedCorrectly =
			confirmationValue === `${ this.props.newDomainName }.wordpress.com`;

		this.setState( {
			confirmationValue,
			confirmationTypedCorrectly,
		} );
	};

	onConfirm = closeDialog => {
		this.props.onConfirm( this.props.targetSite, closeDialog );
	};

	render() {
		const {
			disabledDialogButtons,
			isVisible,
			newDomainName,
			currentDomainName,
			translate,
		} = this.props;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
				disabled: disabledDialogButtons,
			},
			{
				action: 'confirm',
				label: translate( 'Change Site Address' ),
				onClick: this.onConfirm,
				disabled: disabledDialogButtons || ! this.state.confirmationTypedCorrectly,
				isPrimary: true,
			},
		];

		return (
			<Dialog
				className="simple-site-rename-form__dialog"
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ this.props.onClose }
			>
				<h1>{ translate( 'Confirm Site Adress Change' ) }</h1>
				<p>
					{ translate(
						'Please type your new address {{green}}%(newDomainName)s.wordpress.com{{/green}} ' +
							'into the field below to confirm the change. ' +
							'Your site will no longer be available at {{red}}%(currentDomainName)s.wordpress.com{{/red}}. ' +
							'This change cannot be undone.',
						{
							args: { currentDomainName, newDomainName },
							components: {
								green: <strong className="simple-site-rename-form__copy-green" />,
								red: <strong className="simple-site-rename-form__copy-red" />,
							},
						}
					) }
				</p>
				<FormTextInput value={ this.state.confirmationValue } onChange={ this.onConfirmChange } />
			</Dialog>
		);
	}
}

export default localize( RenameSiteConfirmationDialog );
