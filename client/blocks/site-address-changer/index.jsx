import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button, CheckboxControl, Icon, Modal } from '@wordpress/components';
import { check, closeSmall, chevronDown, info } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { debounce, get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { freeSiteAddressType } from 'calypso/lib/domains/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	clearValidationError,
	requestSiteAddressAvailability,
	requestSiteAddressChange,
} from 'calypso/state/site-address-change/actions';
import { getSiteAddressAvailabilityPending } from 'calypso/state/site-address-change/selectors/get-site-address-availability-pending';
import { getSiteAddressValidationError } from 'calypso/state/site-address-change/selectors/get-site-address-validation-error';
import { isRequestingSiteAddressChange } from 'calypso/state/site-address-change/selectors/is-requesting-site-address-change';
import { isSiteAddressValidationAvailable } from 'calypso/state/site-address-change/selectors/is-site-address-validation-available';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;
const VALIDATION_DEBOUNCE_MS = 800;

export class SiteAddressChanger extends Component {
	static propTypes = {
		currentDomainSuffix: PropTypes.string.isRequired,
		currentDomain: PropTypes.object.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		onSiteAddressChanged: PropTypes.func,
		hasNonWpcomDomains: PropTypes.bool,
		skipRedirection: PropTypes.bool,

		// `connect`ed
		isSiteAddressChangeRequesting: PropTypes.bool,
		siteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
	};

	static defaultProps = {
		currentDomainSuffix: '.wordpress.com',
		currentDomain: {},
	};

	state = {
		step: 0,
		domainFieldValue: '',
		newDomainSuffix: this.props.currentDomainSuffix,
		confirmEmailSent: 0,
		isConfirmationChecked: false,
	};

	componentDidMount() {
		this.props.clearValidationError( this.props.siteId );
	}

	onConfirm = async () => {
		const { domainFieldValue, newDomainSuffix } = this.state;
		const { currentDomain, currentDomainSuffix, siteId } = this.props;
		const oldDomain = get( currentDomain, 'name', null );
		const type =
			'.wordpress.com' === currentDomainSuffix
				? freeSiteAddressType.BLOG
				: freeSiteAddressType.MANAGED;

		await this.props.requestSiteAddressChange(
			siteId,
			domainFieldValue,
			newDomainSuffix.substr( 1 ),
			oldDomain,
			type,
			true,
			true,
			this.props.skipRedirection
		);

		this.props.onSiteAddressChanged?.();
	};

	setValidationState = () => {
		const { translate } = this.props;
		const { domainFieldValue } = this.state;

		let validationProperties = {
			showValidationMessage: false,
			validationMessage: '',
		};

		if ( isEmpty( domainFieldValue ) ) {
			this.setState( validationProperties );
			return;
		}

		if ( domainFieldValue.match( /[^a-z0-9]/i ) ) {
			validationProperties = {
				showValidationMessage: true,
				validationMessage: translate( 'Your site address can only contain letters and numbers.' ),
			};
		}

		if (
			domainFieldValue.length < SUBDOMAIN_LENGTH_MINIMUM ||
			domainFieldValue.length > SUBDOMAIN_LENGTH_MAXIMUM
		) {
			validationProperties = {
				showValidationMessage: domainFieldValue.length > SUBDOMAIN_LENGTH_MAXIMUM,
				validationMessage: translate(
					'Your site address should be between %(minimumLength)s and %(maximumLength)s characters in length.',
					{
						args: {
							minimumLength: SUBDOMAIN_LENGTH_MINIMUM,
							maximumLength: SUBDOMAIN_LENGTH_MAXIMUM,
						},
					}
				),
			};
		}

		this.setState( validationProperties, () => {
			this.state.validationMessage
				? this.debouncedShowValidationMessage()
				: this.debouncedValidationCheck();
		} );
	};

	showConfirmationForm() {
		this.setState( {
			step: 1,
		} );
	}

	onSubmit = () => {
		if ( ! this.state.validationMessage ) {
			this.showConfirmationForm();
		}
	};

	toggleConfirmationChecked = () => {
		this.setState( {
			isConfirmationChecked: ! this.state.isConfirmationChecked,
		} );
	};

	goBackToFirstStep = () => {
		this.setState( {
			step: 0,
		} );
	};

	handleDomainChange( domainFieldValue ) {
		if ( this.props.isAvailabilityPending || this.props.isSiteAddressChangeRequesting ) {
			return;
		}

		this.debouncedValidationCheck.cancel();
		this.debouncedShowValidationMessage.cancel();

		this.props.clearValidationError( this.props.siteId );
		this.setState(
			{
				domainFieldValue,
			},
			this.setValidationState
		);
	}

	onFieldChange = ( event ) => {
		const domainFieldValue = get( event, 'target.value', '' ).toLowerCase();
		this.handleDomainChange( domainFieldValue );
	};

	onDomainSuffixChange = ( event ) => {
		const newDomainSuffix = get( event, 'target.value', '' );
		this.setState( { newDomainSuffix } );
		this.handleDomainChange( this.state.domainFieldValue );
	};

	debouncedShowValidationMessage = debounce( () => {
		if ( this.state.validationMessage ) {
			this.setState( {
				showValidationMessage: true,
			} );
		}
	}, VALIDATION_DEBOUNCE_MS );

	debouncedValidationCheck = debounce( () => {
		const { domainFieldValue, newDomainSuffix } = this.state;
		const { currentDomainSuffix } = this.props;

		// Don't try and validate what we know is invalid
		if (
			isEmpty( domainFieldValue ) ||
			( domainFieldValue === this.getCurrentDomainPrefix() &&
				newDomainSuffix === currentDomainSuffix )
		) {
			return;
		}

		const type =
			'.wordpress.com' === newDomainSuffix ? freeSiteAddressType.BLOG : freeSiteAddressType.MANAGED;

		this.props.requestSiteAddressAvailability(
			this.props.siteId,
			domainFieldValue,
			newDomainSuffix.substr( 1 ),
			type
		);
	}, VALIDATION_DEBOUNCE_MS );

	shouldShowValidationMessage() {
		const { isAvailable, validationError } = this.props;
		const { showValidationMessage } = this.state;
		const serverValidationMessage = get( validationError, 'message' );

		return isAvailable || showValidationMessage || !! serverValidationMessage;
	}

	getCurrentDomainPrefix() {
		const { currentDomain, currentDomainSuffix } = this.props;

		const currentDomainName = get( currentDomain, 'name', '' );
		return currentDomainName.replace( currentDomainSuffix, '' );
	}

	/**
	 * This is an edge case scenario where user have the site address changer opened and the user transfers
	 * the site to atomic on other tab/window, losing sync between client and server. Client will try to
	 * check availability against wordpress.com and will receive 404s because site is transfered to wpcomstaging.com
	 */
	isUnsyncedAtomicSite() {
		const { validationError } = this.props;

		return 404 === validationError?.errorStatus;
	}

	getValidationMessage() {
		const { isAvailable, validationError, translate } = this.props;
		const { validationMessage } = this.state;
		const serverValidationMessage = get( validationError, 'message' );

		if ( this.isUnsyncedAtomicSite() ) {
			return translate( "This site's address cannot be changed" );
		}

		return isAvailable
			? translate( 'Good news, that site address is available!' )
			: validationMessage || serverValidationMessage;
	}

	resendConfirmationLink = () => {
		const { sendVerifyEmail } = this.props;
		sendVerifyEmail();
		this.setState( {
			confirmEmailSent: 1,
		} );
	};

	getConfirmEmailMessage() {
		return this.state.confirmEmailSent
			? this.props.translate( 'Please check your inbox for a confirmation email.' )
			: this.props.translate(
					'You need to confirm your email in order to change the site address.'
			  );
	}

	renderDomainSuffix() {
		const { currentDomainSuffix } = this.props;
		if ( currentDomainSuffix === '.wordpress.com' ) {
			return currentDomainSuffix;
		}

		const suffixesList = [ '.wordpress.com', currentDomainSuffix ];
		const { newDomainSuffix } = this.state;

		return (
			<span className="site-address-changer__affix">
				{ newDomainSuffix }
				<Icon icon={ chevronDown } size={ 18 } className="site-address-changer__select-icon" />
				<FormSelect
					className="site-address-changer__select"
					value={ newDomainSuffix }
					onChange={ this.onDomainSuffixChange }
				>
					{ suffixesList.map( ( suffix ) => (
						<option key={ suffix } value={ suffix }>
							{ suffix }
						</option>
					) ) }
				</FormSelect>
			</span>
		);
	}

	handleAddDomainClick = () => {
		const { siteId } = this.props;
		this.props.recordTracksEvent( 'calypso_siteaddresschange_add_domain_click', {
			blogid: siteId,
		} );
	};

	getStepButtons = () => {
		const { translate, isEmailVerified, onClose } = this.props;

		if ( 0 === this.state.step ) {
			const { isAvailabilityPending, isAvailable, isSiteAddressChangeRequesting } = this.props;

			const { domainFieldValue, newDomainSuffix } = this.state;
			const { currentDomainSuffix } = this.props;
			const currentDomainPrefix = this.getCurrentDomainPrefix();
			const isBusy = isSiteAddressChangeRequesting || isAvailabilityPending;

			const isDisabled =
				( domainFieldValue === currentDomainPrefix && newDomainSuffix === currentDomainSuffix ) ||
				! isAvailable ||
				this.isUnsyncedAtomicSite() ||
				! isEmailVerified;

			return [
				{
					action: 'cancel',
					onClick: onClose,
					variant: 'tertiary',
					label: translate( 'Cancel' ),
				},
				{
					action: 'confirm',
					variant: 'primary',
					disabled: isDisabled,
					isBusy: isBusy,
					label: translate( 'Next' ),
					onClick: this.onSubmit,
				},
			];
		} else if ( 1 === this.state.step ) {
			const { isSiteAddressChangeRequesting } = this.props;
			return [
				{
					action: 'cancel',
					onClick: this.goBackToFirstStep,
					variant: 'tertiary',
					label: translate( 'Cancel' ),
				},
				{
					action: 'confirm',
					disabled: ! this.state.isConfirmationChecked || isSiteAddressChangeRequesting,
					variant: 'primary',
					isBusy: isSiteAddressChangeRequesting,
					onClick: this.onConfirm,
					label: translate( 'Confirm' ),
				},
			];
		}
	};

	renderNewAddressForm = () => {
		const {
			currentDomain,
			isAvailable,
			siteId,
			selectedSiteSlug,
			translate,
			isAtomicSite,
			hasNonWpcomDomains,
			isEmailVerified,
		} = this.props;

		if ( isAtomicSite ) {
			return (
				<div className="site-address-changer__info-message">
					<span className="site-address-changer__info-icon">
						<Icon icon={ info } size={ 18 } />
					</span>
					<span>{ translate( 'wpcomstaging.com addresses cannot be changed.' ) }</span>
				</div>
			);
		}

		if ( ! currentDomain.currentUserCanManage ) {
			return (
				<div className="site-address-changer__info-message site-address-changer__only-owner-info">
					<span className="site-address-changer__info-icon">
						<Icon icon={ info } size={ 18 } />
					</span>
					<span>
						{ isEmpty( currentDomain.owner )
							? translate( 'Only the site owner can edit this domain name.' )
							: translate(
									'Only the site owner ({{strong}}%(ownerInfo)s{{/strong}}) can edit this domain name.',
									{
										args: { ownerInfo: currentDomain.owner },
										components: { strong: <strong /> },
									}
							  ) }
					</span>
				</div>
			);
		}

		const { domainFieldValue, confirmEmailSent } = this.state;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = this.getCurrentDomainPrefix();
		const shouldShowValidationMessage = this.shouldShowValidationMessage();
		const validationMessage = this.getValidationMessage();
		const confirmEmailMessage = this.getConfirmEmailMessage();

		const addDomainPath = '/domains/add/' + selectedSiteSlug;

		return (
			<div className="site-address-changer__content">
				<TrackComponentView
					eventName="calypso_siteaddresschange_form_view"
					eventProperties={ { blog_id: siteId } }
				/>
				{ ! isEmailVerified && (
					<Banner
						title=""
						className="site-address-changer__email-confirmation-banner"
						callToAction={ ! confirmEmailSent ? translate( 'Resend email' ) : null }
						description={ confirmEmailMessage }
						icon="info-outline"
						onClick={ ! confirmEmailSent ? this.resendConfirmationLink : null }
						disableHref
					/>
				) }
				<div className="site-address-changer__details">
					<FormLabel htmlFor="site-address-changer__text-input">
						{ translate( 'New site address' ) }
					</FormLabel>
					<FormTextInputWithAffixes
						id="site-address-changer__text-input"
						className="site-address-changer__input"
						value={ domainFieldValue }
						suffix={ this.renderDomainSuffix() }
						onChange={ this.onFieldChange }
						placeholder={ currentDomainPrefix }
						isError={ shouldShowValidationMessage && ! isAvailable }
						disabled={ ! isEmailVerified }
						noWrap
					/>
					{ shouldShowValidationMessage && (
						<FormInputValidation isError={ ! isAvailable } text={ validationMessage || '\u00A0' } />
					) }
					<div className="site-address-changer__info">
						<p className="site-address-changer__message">
							{ translate(
								'Keep in mind that once you change your site address, %(currentDomainName)s will no longer be available.',
								{
									args: { currentDomainName },
								}
							) }
						</p>
						{ ! hasNonWpcomDomains && (
							<p>
								{ translate( '{{a}}Add a custom domain{{/a}} instead?', {
									components: {
										a: <a href={ addDomainPath } onClick={ this.handleAddDomainClick } />,
									},
								} ) }
							</p>
						) }
					</div>
				</div>
			</div>
		);
	};

	renderConfirmationForm = () => {
		const { currentDomainSuffix, siteId, translate } = this.props;
		const { domainFieldValue: newDomainName, newDomainSuffix } = this.state;
		const currentDomainPrefix = this.getCurrentDomainPrefix();

		return (
			<form className="site-address-changer__content">
				<TrackComponentView
					eventName="calypso_siteaddresschange_areyousure_view"
					eventProperties={ {
						blog_id: siteId,
						new_domain: newDomainName,
					} }
				/>
				<p>{ translate( 'Once you confirm, this will be the new address for your site:' ) }</p>
				<div className="site-address-changer__confirmation-detail">
					<span className="site-address-changer__icon-wrapper">
						<Icon icon={ check } size={ 24 } className="site-address-changer__copy-addition" />
					</span>
					<p className="site-address-changer__confirmation-detail-copy site-address-changer__copy-addition">
						<strong>{ newDomainName }</strong>
						{ newDomainSuffix }
					</p>
				</div>

				<p>{ translate( 'And this address will be removed and unavailable for use:' ) }</p>

				<div className="site-address-changer__confirmation-detail">
					<span className="site-address-changer__icon-wrapper">
						<Icon icon={ closeSmall } size={ 24 } className="site-address-changer__copy-deletion" />
					</span>
					<p className="site-address-changer__confirmation-detail-copy site-address-changer__copy-deletion">
						<strong>{ currentDomainPrefix }</strong>
						{ currentDomainSuffix }
					</p>
				</div>
				<CheckboxControl
					label={ translate( "I understand that I won't be able to undo this change." ) }
					checked={ this.state.isConfirmationChecked }
					onChange={ this.toggleConfirmationChecked }
					__nextHasNoMarginBottom
				/>
			</form>
		);
	};

	render() {
		const { isDialogVisible, onClose, translate } = this.props;
		const buttons = this.getStepButtons();
		const modalTitle =
			this.state.step === 0
				? translate( 'Change your site address' )
				: translate( 'Confirm the address change' );

		return (
			<Modal
				title={ modalTitle }
				size="medium"
				isVisible={ isDialogVisible }
				onRequestClose={ onClose }
				showCloseIcon
			>
				{ 0 === this.state.step && this.renderNewAddressForm() }
				{ 1 === this.state.step && this.renderConfirmationForm() }

				<div className="site-address-changer__modal-buttons">
					{ buttons.map( ( button ) => (
						<Button
							key={ button.action }
							variant={ button.variant }
							disabled={ button.disabled }
							isBusy={ button.isBusy }
							onClick={ button.onClick }
						>
							{ button.label }
						</Button>
					) ) }
				</div>
			</Modal>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			selectedSiteSlug: getSiteSlug( state, siteId ),
			isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
			isAvailable: isSiteAddressValidationAvailable( state, siteId ),
			isSiteAddressChangeRequesting: isRequestingSiteAddressChange( state, siteId ),
			isAvailabilityPending: getSiteAddressAvailabilityPending( state, siteId ),
			validationError: getSiteAddressValidationError( state, siteId ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
		};
	},
	{
		requestSiteAddressChange,
		requestSiteAddressAvailability,
		clearValidationError,
		recordTracksEvent,
		sendVerifyEmail: verifyEmail,
	}
)( localize( SiteAddressChanger ) );
