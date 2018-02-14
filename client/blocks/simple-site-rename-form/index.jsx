/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get, flow } from 'lodash';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import ConfirmationDialog from './dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import { requestSiteRename } from 'state/site-rename/actions';
import { isRequestingSiteRename } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class SimpleSiteRenameForm extends Component {
	static defaultProps = {
		currentDomainSuffix: '.wordpress.com',
		currentDomain: {},
	};

	state = {
		showDialog: false,
		domainFieldValue: '',
	};

	onConfirm = () => {
		const { selectedSiteId } = this.props;
		// @TODO: Give ability to chose whether or not to discard the original domain name.
		const discard = true;

		this.props.requestSiteRename( selectedSiteId, this.state.domainFieldValue, discard );
	};

	showConfirmationDialog() {
		this.setState( {
			showDialog: true,
		} );
	}

	onSubmit = event => {
		this.showConfirmationDialog();
		event.preventDefault();
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	onFieldChange = event => {
		this.setState( { domainFieldValue: get( event, 'target.value' ) } );
	};

	render() {
		const { currentDomain, currentDomainSuffix, isSiteRenameRequesting, translate } = this.props;
		const currentDomainPrefix = get( currentDomain, 'name', '' ).replace( currentDomainSuffix, '' );
		const isWPCOM = get( currentDomain, 'type' ) === 'WPCOM';
		const isDisabled =
			! isWPCOM ||
			! this.state.domainFieldValue ||
			this.state.domainFieldValue === currentDomainPrefix;

		return (
			<div className="simple-site-rename-form">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ this.state.domainFieldValue }
					currentDomainName={ currentDomainPrefix }
					onConfirm={ this.onConfirm }
				/>
				<form onSubmit={ this.onSubmit }>
					<Card className="simple-site-rename-form__content">
						<FormSectionHeading>{ translate( 'Edit Domain Name' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							type="text"
							value={ this.state.domainFieldValue }
							suffix={ currentDomainSuffix }
							onChange={ this.onFieldChange }
							placeholder={ currentDomainPrefix }
						/>
						<div className="simple-site-rename-form__footer">
							<div className="simple-site-rename-form__info">
								<Gridicon icon="info-outline" size={ 18 } />
								<p>
									{ translate(
										'Once changed, previous domain names will no longer be available.'
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
