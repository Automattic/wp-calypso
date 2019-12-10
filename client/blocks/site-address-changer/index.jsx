/* eslint-disable jsx-a11y/no-onchange */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { debounce, get, flow, inRange, isEmpty } from 'lodash';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import ConfirmationDialog from './dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import TrackComponentView from 'lib/analytics/track-component-view';
import {
	requestSiteAddressChange,
	requestSiteAddressAvailability,
	clearValidationError,
} from 'state/site-address-change/actions';
import getSiteAddressAvailabilityPending from 'state/selectors/get-site-address-availability-pending';
import getSiteAddressValidationError from 'state/selectors/get-site-address-validation-error';
import isRequestingSiteAddressChange from 'state/selectors/is-requesting-site-address-change';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;
const ADDRESS_CHANGE_SUPPORT_URL = 'https://support.wordpress.com/changing-blog-address/';
const VALIDATION_DEBOUNCE_MS = 800;

export class SiteAddressChanger extends Component {
	static propTypes = {
		currentDomainSuffix: PropTypes.string.isRequired,
		currentDomain: PropTypes.object.isRequired,

		// `connect`ed
		isSiteAddressChangeRequesting: PropTypes.bool,
		siteId: PropTypes.number,
	};

	static defaultProps = {
		currentDomainSuffix: '.wordpress.com',
		currentDomain: {},
	};

	state = {
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

	onFieldChange = event => {
		const domainFieldValue = get( event, 'target.value', '' ).toLowerCase();
		this.handleDomainChange( domainFieldValue );
	};

	onDomainSuffixChange = event => {
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

	getValidationMessage() {
		const { isAvailable, validationError, translate } = this.props;
		const { validationMessage } = this.state;
		const serverValidationMessage = get( validationError, 'message' );

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
				<select
					className="site-address-changer__select"
					value={ newDomainSuffix }
					onChange={ this.onDomainSuffixChange }
				>
					{ suffixesList.map( suffix => (
						<option key={ suffix } value={ suffix }>
							{ suffix }
						</option>
					) ) }
				</select>
			</span>
		);
	}

	render() {
		const {
			currentDomain,
			isAvailabilityPending,
			isAvailable,
			isSiteAddressChangeRequesting,
			siteId,
			translate,
		} = this.props;

		const { domainFieldValue, newDomainSuffix } = this.state;
		const { currentDomainSuffix } = this.props;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = this.getCurrentDomainPrefix();
		const shouldShowValidationMessage = this.shouldShowValidationMessage();
		const validationMessage = this.getValidationMessage();
		const isBusy = isSiteAddressChangeRequesting || isAvailabilityPending;
		const isDisabled =
			( domainFieldValue === currentDomainPrefix && newDomainSuffix === currentDomainSuffix ) ||
			! isAvailable;

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

		return (
			<div className="site-address-changer">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ domainFieldValue }
					newDomainSuffix={ this.state.newDomainSuffix }
					currentDomainName={ currentDomainPrefix }
					currentDomainSuffix={ this.props.currentDomainSuffix }
					onConfirm={ this.onConfirm }
					siteId={ siteId }
				/>
				<form onSubmit={ this.onSubmit }>
					<TrackComponentView
						eventName="calypso_siteaddresschange_form_view"
						eventProperties={ { blog_id: siteId } }
					/>
					<Card className="site-address-changer__content">
						<FormSectionHeading>{ translate( 'Change Site Address' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							className="site-address-changer__input"
							type="text"
							value={ domainFieldValue }
							suffix={ this.renderDomainSuffix() }
							onChange={ this.onFieldChange }
							placeholder={ currentDomainPrefix }
							isError={ shouldShowValidationMessage && ! isAvailable }
						/>
						<FormInputValidation
							isHidden={ ! shouldShowValidationMessage }
							isError={ ! isAvailable }
							text={ validationMessage || '\u00A0' }
						/>
						<div className="site-address-changer__footer">
							<div className="site-address-changer__info">
								<Gridicon icon="info-outline" size={ 18 } />
								<p>
									{ translate(
										'Once you change your site address, %(currentDomainName)s will no longer be available.',
										{
											args: { currentDomainName },
										}
									) }{ ' ' }
									<a href={ ADDRESS_CHANGE_SUPPORT_URL } target="_blank" rel="noopener noreferrer">
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
			const isAvailable = get( state, [
				'siteAddressChange',
				'validation',
				siteId,
				'isAvailable',
			] );

			return {
				siteId,
				isAvailable,
				isSiteAddressChangeRequesting: isRequestingSiteAddressChange( state, siteId ),
				isAvailabilityPending: getSiteAddressAvailabilityPending( state, siteId ),
				validationError: getSiteAddressValidationError( state, siteId ),
			};
		},
		{
			requestSiteAddressChange,
			requestSiteAddressAvailability,
			clearValidationError,
		}
	)
)( SiteAddressChanger );
