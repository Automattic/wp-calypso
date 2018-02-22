/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, flow, inRange, isEmpty } from 'lodash';
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
import { requestSiteRename } from 'state/site-rename/actions';
import { isRequestingSiteRename } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;

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

	onConfirm = () => {
		const { selectedSiteId } = this.props;
		// @TODO: Give ability to chose whether or not to discard the original site address.
		const discard = true;

		this.props.requestSiteRename( selectedSiteId, this.state.domainFieldValue, discard );
	};

	getDomainValidationMessage( domain ) {
		const { translate } = this.props;

		if ( isEmpty( domain ) ) {
			return '';
		}

		if ( domain.match( /[^a-z0-9]/i ) ) {
			return translate( 'Site address can only contain letters (a-z) and numbers.' );
		}

		if ( ! inRange( domain.length, SUBDOMAIN_LENGTH_MINIMUM, SUBDOMAIN_LENGTH_MAXIMUM ) ) {
			return translate(
				'Site address length should be between %(minimumLength)s and %(maximumLength)s characters.',
				{
					args: {
						minimumLength: SUBDOMAIN_LENGTH_MINIMUM,
						maximumLength: SUBDOMAIN_LENGTH_MAXIMUM,
					},
				}
			);
		}

		return '';
	}

	showConfirmationDialog() {
		this.setState( {
			showDialog: true,
		} );
	}

	onSubmit = event => {
		const domainFieldError = this.getDomainValidationMessage( this.state.domainFieldValue );

		this.setState( { domainFieldError } );
		! domainFieldError && this.showConfirmationDialog();

		event.preventDefault();
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	onFieldChange = event => {
		const domainFieldValue = get( event, 'target.value', '' ).toLowerCase();
		const shouldUpdateError = ! isEmpty( this.state.domainFieldError );

		this.setState( {
			domainFieldValue,
			...( shouldUpdateError && {
				domainFieldError: this.getDomainValidationMessage( domainFieldValue ),
			} ),
		} );
	};

	render() {
		const { currentDomain, currentDomainSuffix, isSiteRenameRequesting, translate } = this.props;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = currentDomainName.replace( currentDomainSuffix, '' );
		const { domainFieldError, domainFieldValue } = this.state;
		const isDisabled =
			! domainFieldValue || !! domainFieldError || domainFieldValue === currentDomainPrefix;

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
					<Card className="simple-site-rename-form__content">
						<FormSectionHeading>{ translate( 'Edit Site Address' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							type="text"
							value={ this.state.domainFieldValue }
							suffix={ currentDomainSuffix }
							onChange={ this.onFieldChange }
							placeholder={ currentDomainPrefix }
							isError={ !! domainFieldError }
						/>
						{ domainFieldError && <FormInputValidation isError text={ domainFieldError } /> }
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
							<FormButton disabled={ isDisabled } busy={ isSiteRenameRequesting } type="submit">
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

			return {
				selectedSiteId: siteId,
				isSiteRenameRequesting: isRequestingSiteRename( state, siteId ),
			};
		},
		{
			requestSiteRename,
		}
	)
)( SimpleSiteRenameForm );
