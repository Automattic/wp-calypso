import { Dialog, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { debounce, get, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
		showDialog: false,
		domainFieldValue: '',
		newDomainSuffix: this.props.currentDomainSuffix,
	};

	componentDidMount() {
		this.props.clearValidationError( this.props.siteId );
	}

	onConfirm = () => {
		const { domainFieldValue, newDomainSuffix } = this.state;
		const { currentDomain, currentDomainSuffix, siteId } = this.props;
		const oldDomain = get( currentDomain, 'name', null );
		const type = '.wordpress.com' === currentDomainSuffix ? 'blog' : 'dotblog';

		this.props.requestSiteAddressChange(
			siteId,
			domainFieldValue,
			newDomainSuffix.substr( 1 ),
			oldDomain,
			type
		);
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

	onConfirmationFormClose = () => {
		this.setState( {
			step: 0,
		} );
	};

	toggleConfirmationChecked = () => {
		this.setState( {
			isConfirmationChecked: ! this.state.isConfirmationChecked,
		} );
	};

	onConfirmationFormSubmit = () => {
		this.onConfirmationFormClose();
		this.onConfirm();
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

		const type = '.wordpress.com' === newDomainSuffix ? 'blog' : 'dotblog';

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
				<Gridicon icon="chevron-down" size={ 18 } className="site-address-changer__select-icon" />
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
		const { translate } = this.props;

		if ( 0 === this.state.step ) {
			const { isAvailabilityPending, isAvailable, isSiteAddressChangeRequesting } = this.props;

			const { domainFieldValue, newDomainSuffix } = this.state;
			const { currentDomainSuffix } = this.props;
			const currentDomainPrefix = this.getCurrentDomainPrefix();
			const isBusy = isSiteAddressChangeRequesting || isAvailabilityPending;

			const isDisabled =
				( domainFieldValue === currentDomainPrefix && newDomainSuffix === currentDomainSuffix ) ||
				! isAvailable ||
				this.isUnsyncedAtomicSite();

			return [
				{
					action: 'confirm',
					additionalClassNames: [ isBusy ? 'is-busy' : '' ],
					isPrimary: true,
					disabled: isDisabled,
					label: translate( 'Change site address' ),
					onClick: this.onSubmit,
				},
			];
		} else if ( 1 === this.state.step ) {
			return [
				{
					action: 'cancel',
					onClick: this.onConfirmationFormClose,
					isPrimary: false,
					label: translate( 'Cancel' ),
				},
				{
					action: 'confirm',
					disabled: ! this.state.isConfirmationChecked,
					isPrimary: true,
					onClick: this.onConfirmationFormSubmit,
					label: translate( 'Change site address' ),
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
		} = this.props;

		if ( isAtomicSite ) {
			return (
				<div className="site-address-changer__content">
					<Gridicon icon="info-outline" />
					{ translate( 'wpcomstaging.com addresses cannot be changed.' ) }
				</div>
			);
		}

		if ( ! currentDomain.currentUserCanManage ) {
			return (
				<div className="site-address-changer site-address-changer__only-owner-info">
					<Gridicon icon="info-outline" />
					{ isEmpty( currentDomain.owner )
						? translate( 'Only the site owner can edit this domain name.' )
						: translate(
								'Only the site owner ({{strong}}%(ownerInfo)s{{/strong}}) can edit this domain name.',
								{
									args: { ownerInfo: currentDomain.owner },
									components: { strong: <strong /> },
								}
						  ) }
				</div>
			);
		}

		const { domainFieldValue } = this.state;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = this.getCurrentDomainPrefix();
		const shouldShowValidationMessage = this.shouldShowValidationMessage();
		const validationMessage = this.getValidationMessage();

		const addDomainPath = '/domains/add/' + selectedSiteSlug;

		return (
			<div className="site-address-changer__content">
				<TrackComponentView
					eventName="calypso_siteaddresschange_form_view"
					eventProperties={ { blog_id: siteId } }
				/>
				<FormSectionHeading>
					<strong>{ translate( 'Change your site address' ) }</strong>
				</FormSectionHeading>
				<div className="site-address-changer__info">
					<p>
						{ translate(
							'Once you change your site address, %(currentDomainName)s will no longer be available. {{a}}Did you want to add a custom domain instead?{{/a}}',
							{
								args: { currentDomainName },
								components: {
									a: <a href={ addDomainPath } onClick={ this.handleAddDomainClick } />,
								},
							}
						) }
					</p>
				</div>
				<div className="site-address-changer__details">
					<FormLabel htmlFor="site-address-changer__text-input">
						{ translate( 'Enter your new site address' ) }
					</FormLabel>
					<FormTextInputWithAffixes
						id="site-address-changer__text-input"
						className="site-address-changer__input"
						value={ domainFieldValue }
						suffix={ this.renderDomainSuffix() }
						onChange={ this.onFieldChange }
						placeholder={ currentDomainPrefix }
						isError={ shouldShowValidationMessage && ! isAvailable }
						noWrap
					/>
					<FormInputValidation
						isHidden={ ! shouldShowValidationMessage }
						isError={ ! isAvailable }
						text={ validationMessage || '\u00A0' }
					/>
				</div>
			</div>
		);
	};

	renderConfirmationForm = () => {
		const { currentDomainSuffix, siteId, translate } = this.props;
		const { domainFieldValue: newDomainName, newDomainSuffix } = this.state;
		const currentDomainPrefix = this.getCurrentDomainPrefix();

		return (
			<form className="site-address-changer__dialog">
				<TrackComponentView
					eventName="calypso_siteaddresschange_areyousure_view"
					eventProperties={ {
						blog_id: siteId,
						new_domain: newDomainName,
					} }
				/>
				<h1 className="site-address-changer__dialog-heading">
					{ translate( 'Confirm your decision' ) }
				</h1>
				<div className="site-address-changer__confirmation-detail">
					<Gridicon
						icon="cross-circle"
						size={ 18 }
						className="site-address-changer__copy-deletion"
					/>
					<p className="site-address-changer__confirmation-detail-copy site-address-changer__copy-deletion">
						{ translate(
							'{{strong}}%(currentDomainPrefix)s{{/strong}}%(currentDomainSuffix)s will be removed and unavailable for use.',
							{
								components: {
									strong: <strong />,
								},
								args: {
									currentDomainPrefix,
									currentDomainSuffix,
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
									newDomainName,
									newDomainSuffix,
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
			</form>
		);
	};

	render() {
		const { isDialogVisible, onClose } = this.props;

		return (
			<Dialog
				buttons={ this.getStepButtons() }
				className="site-address-changer"
				isVisible={ isDialogVisible }
				onClose={ onClose }
				leaveTimeout={ 0 }
			>
				{ 0 === this.state.step && this.renderNewAddressForm() }
				{ 1 === this.state.step && this.renderConfirmationForm() }
			</Dialog>
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
		};
	},
	{
		requestSiteAddressChange,
		requestSiteAddressAvailability,
		clearValidationError,
		recordTracksEvent,
	}
)( localize( SiteAddressChanger ) );
