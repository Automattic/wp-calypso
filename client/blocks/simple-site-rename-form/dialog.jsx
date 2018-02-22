/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import Dialog from 'components/dialog';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';

class SiteRenamerConfirmationDialog extends PureComponent {
	static propTypes = {
		currentDomainSuffix: PropTypes.string,
		isVisible: PropTypes.bool,
		newDomainSuffix: PropTypes.string,
		onConfirm: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
		onConfirm: noop,
		currentDomainSuffix: '.wordpress.com',
		newDomainSuffix: '.wordpress.com',
	};

	state = {
		isConfirmationChecked: false,
	};

	toggleConfirmationChecked = () => {
		this.setState( {
			isConfirmationChecked: ! this.state.isConfirmationChecked,
		} );
	};

	onConfirm = closeDialog => {
		this.onClose();
		this.props.onConfirm( this.props.targetSite, closeDialog );
	};

	onClose = () => {
		this.props.onClose();
		this.setState( {
			isConfirmationChecked: false,
		} );
	};

	render() {
		const {
			currentDomainName,
			currentDomainSuffix,
			isVisible,
			newDomainName,
			newDomainSuffix,
			translate,
		} = this.props;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'confirm',
				label: translate( 'Change Site Address' ),
				onClick: this.onConfirm,
				disabled: ! this.state.isConfirmationChecked,
				isPrimary: true,
			},
		];

		return (
			<Dialog
				className="simple-site-rename-form__dialog"
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ this.onClose }
			>
				<h1>{ translate( "Let's Review" ) }</h1>
				<p>
					{ translate(
						'You are about to change your site address. Once changed, ' +
							'your previous site address will be unavailable for you or anyone else.'
					) }
				</p>
				<div className="simple-site-rename-form__confirmation-detail">
					<Gridicon
						icon="cross-circle"
						size={ 18 }
						className="simple-site-rename-form__copy-deletion"
					/>
					<p className="simple-site-rename-form__confirmation-detail-copy">
						<strong className="simple-site-rename-form__copy-deletion">
							{ currentDomainName }
						</strong>
						{ currentDomainSuffix }
						<br />
						{ translate( 'Will be removed and unavailable for use.' ) }
					</p>
				</div>
				<div className="simple-site-rename-form__confirmation-detail">
					<Gridicon
						icon="checkmark-circle"
						size={ 18 }
						className="simple-site-rename-form__copy-addition"
					/>
					<p className="simple-site-rename-form__confirmation-detail-copy">
						<strong className="simple-site-rename-form__copy-addition">{ newDomainName }</strong>
						{ newDomainSuffix }
						<br />
						{ translate( 'Will be your new site address.' ) }
					</p>
				</div>
				<h1>{ translate( 'Check the box to confirm' ) }</h1>
				<FormLabel>
					<FormInputCheckbox
						checked={ this.state.isConfirmationChecked }
						onChange={ this.toggleConfirmationChecked }
					/>
					<span>{ translate( "I've double-checked and understand there is no undo." ) }</span>
				</FormLabel>
			</Dialog>
		);
	}
}

export default localize( SiteRenamerConfirmationDialog );
