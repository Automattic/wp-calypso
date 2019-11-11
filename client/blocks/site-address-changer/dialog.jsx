/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { Dialog } from '@automattic/components';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import TrackComponentView from 'lib/analytics/track-component-view';

class SiteAddressChangerConfirmationDialog extends PureComponent {
	static propTypes = {
		currentDomainSuffix: PropTypes.string,
		isVisible: PropTypes.bool,
		newDomainSuffix: PropTypes.string,
		onConfirm: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		siteId: PropTypes.number,
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
			siteId,
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
				className="site-address-changer__dialog"
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ this.onClose }
			>
				<TrackComponentView
					eventName="calypso_siteaddresschange_areyousure_view"
					eventProperties={ {
						blog_id: siteId,
						new_domain: newDomainName,
					} }
				/>
				<h1>{ translate( "Let's review…" ) }</h1>
				<p>
					{ translate(
						"You're about to change your site address. Once you confirm the change, " +
							'this site address will no longer be available for future use.'
					) }
				</p>
				<div className="site-address-changer__confirmation-detail">
					<Gridicon
						icon="cross-circle"
						size={ 18 }
						className="site-address-changer__copy-deletion"
					/>
					<p className="site-address-changer__confirmation-detail-copy">
						<strong className="site-address-changer__copy-deletion">{ currentDomainName }</strong>
						{ currentDomainSuffix }
						<br />
						{ translate( 'Will be removed and unavailable for use.' ) }
					</p>
				</div>
				<div className="site-address-changer__confirmation-detail">
					<Gridicon
						icon="checkmark-circle"
						size={ 18 }
						className="site-address-changer__copy-addition"
					/>
					<p className="site-address-changer__confirmation-detail-copy">
						<strong className="site-address-changer__copy-addition">{ newDomainName }</strong>
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
					<span>
						{ translate(
							"I understand that I won't be able to undo this change to my site address."
						) }
					</span>
				</FormLabel>
			</Dialog>
		);
	}
}

export default localize( SiteAddressChangerConfirmationDialog );
