import { Dialog, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { canRedirect } from 'calypso/lib/domains';

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

	setOption = ( event ) => this.setState( { currentAddressOption: event.currentTarget.value } );

	toggleConfirmationChecked = () => {
		this.setState( {
			isConfirmationChecked: ! this.state.isConfirmationChecked,
		} );
	};

	onConfirm = () => {
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

		let abletoRedirect = true;
		canRedirect( siteId, newDomainName + newDomainSuffix, ( error ) => {
			if ( error ) {
				abletoRedirect = false;
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

				<h2>
					{ translate( 'What would you like to happen with %(currentSiteAddress)s?', {
						args: {
							currentSiteAddress: currentDomainName + currentDomainSuffix,
						},
					} ) }
				</h2>

				<FormFieldset>
					<FormRadio
						id="option-noredirect"
						checked={ this.state.currentAddressOption === 'noredirect' }
						name="noredirect"
						value="noredirect"
						onChange={ this.setOption }
					/>
					<FormLabel htmlFor="option-noredirect">
						<span className="site-address-changer__option">
							{ translate( 'Keep current address without redirecting it' ) }
						</span>
					</FormLabel>
					<FormSettingExplanation>
						{ translate( 'Your current site address will be replaced with a blank site.' ) }
					</FormSettingExplanation>
				</FormFieldset>
				{ abletoRedirect && (
					<FormFieldset>
						<FormRadio
							id="option-redirect"
							checked={ this.state.currentAddressOption === 'redirect' }
							name="redirect"
							value="redirect"
							onChange={ this.setOption }
						/>
						<FormLabel htmlFor="option-redirect">
							<span className="site-address-changer__option">
								{ translate(
									'Redirect to {{strong}}%(newSiteAddress)s{{/strong}} (%(price)s per year)',
									{
										components: { strong: <strong /> },
										args: {
											newSiteAddress: newDomainName + newDomainSuffix,
											price: siteRedirectPrice,
										},
									}
								) }
							</span>
						</FormLabel>
						<FormSettingExplanation>
							{ translate(
								'Visitors to your current site address will be automatically redirected to your new one.'
							) }
						</FormSettingExplanation>
					</FormFieldset>
				) }
				<FormFieldset>
					<FormRadio
						id="option-discard"
						checked={ this.state.currentAddressOption === 'discard' }
						name="discard"
						value="discard"
						onChange={ this.setOption }
					/>
					<FormLabel htmlFor="option-discard">
						<span className="site-address-changer__option">
							{ translate( 'Discard address permanently' ) }
						</span>
					</FormLabel>
					<FormSettingExplanation>
						{ translate( 'Your current site address will not be available for use again.' ) }
					</FormSettingExplanation>
				</FormFieldset>

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
