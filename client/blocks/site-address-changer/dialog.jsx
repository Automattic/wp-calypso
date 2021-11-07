import { Dialog, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { canRedirect } from 'calypso/lib/domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import { PureComponent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';

const noop = () => {};

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
		currentAddressOption: '',
		isConfirmationChecked: false,
	};

	onAnswerChange = ( state ) => {
		this.setState( {
			currentAddressOption: state,
		} );
	};

	toggleConfirmationChecked = () => {
		this.setState( {
			isConfirmationChecked: ! this.state.isConfirmationChecked,
		} );
	};

	onConfirm = ( closeDialog ) => {
		this.props.onConfirm( this.state.currentAddressOption );
		this.onClose();
	};

	onClose = () => {
		this.props.onClose();
		this.setState( {
			currentAddressOption: '',
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
			siteRedirectPrice,
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
				disabled: ! this.state.isConfirmationChecked || ! this.state.currentAddressOption,
				isPrimary: true,
			},
		];

		const options = [
			{
				id: 'redirect',
				answerText: translate(
					'Redirect to {{strong}}%(newSiteAddress)s{{/strong}} (%(price)s per year)',
					{
						components: {
							strong: <strong />,
						},
						args: {
							newSiteAddress: newDomainName + newDomainSuffix,
							price: siteRedirectPrice,
						},
					}
				),
				doNotShuffle: true,
			},
			{
				id: 'no-redirect',
				answerText: translate( 'Keep address without redirecting it' ),
				doNotShuffle: true,
			},
			{
				id: 'discard',
				answerText: translate( 'Deactivate address permanently' ),
				doNotShuffle: true,
			},
		];

		canRedirect( siteId, newDomainName + newDomainSuffix, ( error ) => {
			if ( error ) {
				options.splice();
			}
		} );

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
							'{{strong}}%(currentDomainName)s{{/strong}}%(currentDomainSuffix)s will no longer be your site address.',
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

				<MultipleChoiceQuestion
					answers={ options }
					question={ translate( 'What would you like to happen with %(currentSiteAddress)s?', {
						args: {
							currentSiteAddress: currentDomainName + currentDomainSuffix,
						},
					} ) }
					onAnswerChange={ this.onAnswerChange }
				/>

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
