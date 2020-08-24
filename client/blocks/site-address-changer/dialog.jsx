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

	onConfirm = ( closeDialog ) => {
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
				label: translate( 'Change site address' ),
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
				<h1 className="site-address-changer__dialog-heading">
					{ translate( 'Confirm Site Address Change' ) }
				</h1>
				<div className="site-address-changer__confirmation-detail">
					<Gridicon
						icon="cross-circle"
						size={ 18 }
						className="site-address-changer__copy-deletion"
					/>
					<p className="site-address-changer__confirmation-detail-copy site-address-changer__copy-deletion">
						{ translate(
							'{{strong}}%(currentDomainName)s{{/strong}}%(currentDomainSuffix)s will be removed and unavailable for use.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									currentDomainName: currentDomainName,
									currentDomainSuffix: currentDomainSuffix,
								},
							}
						) }
					</p>
				</div>
				<div className="site-address-changer__confirmation-detail">
					<Gridicon
						icon="checkmark-circle"
						size={ 18 }
						className="site-address-changer__copy-addition"
					/>
					<p className="site-address-changer__confirmation-detail-copy site-address-changer__copy-addition">
						{ translate(
							'{{strong}}%(newDomainName)s{{/strong}}%(newDomainSuffix)s will be your new site address.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									newDomainName: newDomainName,
									newDomainSuffix: newDomainSuffix,
								},
							}
						) }
					</p>
				</div>
				<h2>{ translate( 'Check the box to confirm' ) }</h2>
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
