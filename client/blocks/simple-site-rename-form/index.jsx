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
import {
	isRequestingSiteRename,
	getSiteAddressAvailabilityPending,
	getSiteAddressValidationError,
} from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;
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
		domainFieldError: '',
	};

	componentDidMount() {
		this.props.clearValidationError( this.props.siteId );
	}

	onConfirm = () => {
		const { selectedSiteId } = this.props;
		// @TODO: Give ability to chose whether or not to discard the original site address.
		const discard = true;

		this.props.requestSiteRename( selectedSiteId, this.state.domainFieldValue, discard );
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
			if ( ! this.state.validationMessage ) {
				this.debouncedValidationCheck();
				this.setState( {
					pendingDebounce: true,
				} );
			} else {
				this.debouncedShowValidationMessage();
			}
		} );
	};

	showConfirmationDialog() {
		this.setState( {
			showDialog: true,
		} );
	}

	onSubmit = event => {
		const { siteId } = this.props;
		const { domainFieldValue } = this.state;

		event.preventDefault();

		if ( ! this.state.validationMessage ) {
			this.props.requestSiteRename( siteId, domainFieldValue );
		}
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	onFieldChange = event => {
		const domainFieldValue = get( event, 'target.value', '' ).toLowerCase();

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
		if ( isEmpty( this.state.domainFieldValue ) ) {
			return;
		}

		this.props.requestSiteAddressAvailability( this.props.siteId, this.state.domainFieldValue );
		this.setState( {
			pendingDebounce: false,
		} );
	}, VALIDATION_DEBOUNCE_MS );

	shouldShowValidationMessage() {
		const { isAvailable, validationError } = this.props;
		const { showValidationMessage } = this.state;
		const serverValidationMessage = get( validationError, 'message' );

		return isAvailable || showValidationMessage || !! serverValidationMessage;
	}

	getValidationMessage() {
		const { isAvailable, validationError, translate } = this.props;
		const { validationMessage } = this.state;
		const serverValidationMessage = get( validationError, 'message' );

		return isAvailable
			? translate( 'Good news, this Site Address is available!' )
			: validationMessage || serverValidationMessage;
	}

	render() {
		const {
			currentDomain,
			currentDomainSuffix,
			isAvailabilityPending,
			isSiteRenameRequesting,
			validationError,
			translate,
			isAvailable,
		} = this.props;
		const { domainFieldError, domainFieldValue, pendingDebounce } = this.state;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = currentDomainName.replace( currentDomainSuffix, '' );
		const shouldShowValidationMessage = this.shouldShowValidationMessage();
		const validationMessage = this.getValidationMessage();
		const isDisabled =
			! domainFieldValue ||
			!! domainFieldError ||
			!! validationError ||
			domainFieldValue === currentDomainPrefix ||
			( !! validationMessage && ! isAvailable );
		const isBusy = isSiteRenameRequesting || isAvailabilityPending || pendingDebounce;

		return (
			<div className="simple-site-rename-form">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ domainFieldValue }
					currentDomainName={ currentDomainPrefix }
					onConfirm={ this.onConfirm }
				/>
				<form onSubmit={ this.onSubmit }>
					<TrackComponentView eventName="calypso_siterename_form_view" />
					<Card className="simple-site-rename-form__content">
						<FormSectionHeading>{ translate( 'Change Site Address' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							type="text"
							value={ this.state.domainFieldValue }
							suffix={ currentDomainSuffix }
							onChange={ this.onFieldChange }
							placeholder={ currentDomainPrefix }
							isError={ !! domainFieldError }
						/>
						{ shouldShowValidationMessage &&
							validationMessage && (
								<FormInputValidation isError={ ! isAvailable } text={ validationMessage } />
							) }
						<div className="simple-site-rename-form__footer">
							<div className="simple-site-rename-form__info">
								<Gridicon icon="info-outline" size={ 18 } />
								<p>
									{ translate(
										'Once changed, the current site address %(currentDomainName)s will no longer be available.',
										{
											args: { currentDomainName },
										}
									) }
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
