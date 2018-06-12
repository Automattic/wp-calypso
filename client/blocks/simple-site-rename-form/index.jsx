/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { debounce, get, flow, inRange, isEmpty } from 'lodash';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import ConfirmationDialog from './dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import TrackComponentView from 'lib/analytics/track-component-view';
import {
	requestSiteRename,
	requestSiteAddressAvailability,
	clearValidationError,
} from 'state/site-rename/actions';
import getSiteAddressAvailabilityPending from 'state/selectors/get-site-address-availability-pending';
import getSiteAddressValidationError from 'state/selectors/get-site-address-validation-error';
import isRequestingSiteRename from 'state/selectors/is-requesting-site-rename';
import { getSelectedSiteId } from 'state/ui/selectors';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;
const ADDRESS_CHANGE_SUPPORT_URL = 'https://support.wordpress.com/changing-blog-address/';
const VALIDATION_DEBOUNCE_MS = 800;

export class SimpleSiteRenameForm extends Component {
	static propTypes = {
		currentDomainSuffix: PropTypes.string.isRequired,
		currentDomain: PropTypes.object.isRequired,

		// `connect`ed
		isSiteRenameRequesting: PropTypes.bool,
		selectedSiteId: PropTypes.number,
	};

	static defaultProps = {
		currentDomainSuffix: '.wordpress.com',
		currentDomain: {},
	};

	state = {
		showDialog: false,
		domainFieldValue: '',
	};

	componentDidMount() {
		this.props.clearValidationError( this.props.siteId );
	}

	onConfirm = () => {
		const { selectedSiteId } = this.props;

		this.props.requestSiteRename( selectedSiteId, this.state.domainFieldValue );
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
			! inRange( domainFieldValue.length, SUBDOMAIN_LENGTH_MINIMUM, SUBDOMAIN_LENGTH_MAXIMUM )
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

	showConfirmationDialog() {
		this.setState( {
			showDialog: true,
		} );
	}

	onSubmit = event => {
		event.preventDefault();

		if ( ! this.state.validationMessage ) {
			this.showConfirmationDialog();
		}
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	onFieldChange = event => {
		if ( this.props.isAvailabilityPending || this.props.isSiteRenameRequesting ) {
			return;
		}

		const domainFieldValue = get( event, 'target.value', '' ).toLowerCase();

		this.debouncedValidationCheck.cancel();
		this.debouncedShowValidationMessage.cancel();

		this.props.clearValidationError( this.props.siteId );
		this.setState(
			{
				domainFieldValue,
			},
			this.setValidationState
		);
	};

	debouncedShowValidationMessage = debounce( () => {
		if ( this.state.validationMessage ) {
			this.setState( {
				showValidationMessage: true,
			} );
		}
	}, VALIDATION_DEBOUNCE_MS );

	debouncedValidationCheck = debounce( () => {
		const { domainFieldValue } = this.state;

		// Don't try and validate what we know is invalid
		if ( isEmpty( domainFieldValue ) || domainFieldValue === this.getCurrentDomainPrefix() ) {
			return;
		}
		this.props.requestSiteAddressAvailability( this.props.siteId, domainFieldValue );
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

	getValidationMessage() {
		const { isAvailable, validationError, translate } = this.props;
		const { validationMessage } = this.state;
		const serverValidationMessage = get( validationError, 'message' );

		return isAvailable
			? translate( 'Good news, this site address is available!' )
			: validationMessage || serverValidationMessage;
	}

	render() {
		const {
			currentDomain,
			currentDomainSuffix,
			isAvailabilityPending,
			isAvailable,
			isSiteRenameRequesting,
			siteId,
			translate,
		} = this.props;

		const { domainFieldValue } = this.state;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = this.getCurrentDomainPrefix();
		const shouldShowValidationMessage = this.shouldShowValidationMessage();
		const validationMessage = this.getValidationMessage();
		const isBusy = isSiteRenameRequesting || isAvailabilityPending;
		const isDisabled = domainFieldValue === currentDomainPrefix || ! isAvailable;

		if ( ! currentDomain.currentUserCanManage ) {
			return (
				<div className="simple-site-rename-form simple-site-rename-form__only-owner-info">
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

		return (
			<div className="simple-site-rename-form">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ domainFieldValue }
					currentDomainName={ currentDomainPrefix }
					onConfirm={ this.onConfirm }
					siteId={ siteId }
				/>
				<form onSubmit={ this.onSubmit }>
					<TrackComponentView
						eventName="calypso_siteaddresschange_form_view"
						eventProperties={ { blog_id: siteId } }
					/>
					<Card className="simple-site-rename-form__content">
						<FormSectionHeading>{ translate( 'Change Site Address' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							type="text"
							value={ domainFieldValue }
							suffix={ currentDomainSuffix }
							onChange={ this.onFieldChange }
							placeholder={ currentDomainPrefix }
							isError={ shouldShowValidationMessage && ! isAvailable }
						/>
						<FormInputValidation
							isHidden={ ! shouldShowValidationMessage }
							isError={ ! isAvailable }
							text={ validationMessage || '\u00A0' }
						/>
						<div className="simple-site-rename-form__footer">
							<div className="simple-site-rename-form__info">
								<Gridicon icon="info-outline" size={ 18 } />
								<p>
									{ translate(
										'Once you change your site address, %(currentDomainName)s will no longer be available.',
										{
											args: { currentDomainName },
										}
									) }{' '}
									<a href={ ADDRESS_CHANGE_SUPPORT_URL }>
										{ translate(
											'Before you confirm the change, please read this important information.'
										) }
									</a>
								</p>
							</div>
							<FormButton disabled={ isDisabled } busy={ isBusy } type="submit">
								{ translate( 'Change Site Address' ) }
							</FormButton>
						</div>
					</Card>
				</form>
			</div>
		);
	}
}

export default flow(
	localize,
	connect(
		state => {
			const siteId = getSelectedSiteId( state );
			const isAvailable = get( state, [ 'siteRename', 'validation', siteId, 'isAvailable' ] );

			return {
				siteId,
				selectedSiteId: siteId,
				isAvailable,
				isSiteRenameRequesting: isRequestingSiteRename( state, siteId ),
				isAvailabilityPending: getSiteAddressAvailabilityPending( state, siteId ),
				validationError: getSiteAddressValidationError( state, siteId ),
			};
		},
		{
			requestSiteRename,
			requestSiteAddressAvailability,
			clearValidationError,
		}
	)
)( SimpleSiteRenameForm );
