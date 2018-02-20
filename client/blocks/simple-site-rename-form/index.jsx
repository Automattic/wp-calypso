/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { debounce, get, flow } from 'lodash';
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
import { requestPreflight, requestSiteRename } from 'state/site-rename/actions';
import { isRequestingSiteRename } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class SimpleSiteRenameForm extends Component {
	static defaultProps = {
		currentDomain: {},
	};

	state = {
		showDialog: false,
		domainFieldValue: '',
	};

	debouncedRequestPreflight = debounce( () => {
		this.props.requestPreflight( this.props.selectedSiteId, this.state.domainFieldValue );
	}, 300 );

	onConfirm = () => {
		const { nonce, selectedSiteId } = this.props;
		// @TODO: Give ability to chose whether or not to discard the original domain name.
		const discard = true;

		this.props.requestSiteRename( selectedSiteId, this.state.domainFieldValue, discard, nonce );
	};

	showConfirmationDialog() {
		this.setState( {
			showDialog: true,
		} );
	}

	onSubmit = event => {
		this.debouncedRequestPreflight();
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

	updateCurrentSiteSlug = () => {
		const { currentDomain } = this.props;
		const currentDomainName = get( currentDomain, 'name', '' );
		this.currentSiteSlug = currentDomainName.replace( /\.wordpress\.com$/i, '' );
	};

	componentWillMount() {
		this.updateCurrentSiteSlug();
	}

	componentDidUpdate( prevProps, prevState ) {
		const prevDomainName = get( prevProps, 'currentDomain.name' );
		const newDomainName = get( this.props, 'currentDomain.name' );
		if ( prevDomainName !== newDomainName ) {
			this.updateCurrentSiteSlug();
		}

		const { domainFieldValue } = this.state;
		if (
			! domainFieldValue ||
			domainFieldValue === this.currentSiteSlug ||
			prevState.domainFieldValue === domainFieldValue
		) {
			return;
		}

		this.debouncedRequestPreflight();
	}

	render() {
		const { currentDomain, isSiteRenameRequesting, nonce, translate } = this.props;

		const isWPCOM = get( currentDomain, 'type' ) === 'WPCOM';
		const isDisabled =
			! isWPCOM ||
			! nonce ||
			! this.state.domainFieldValue ||
			this.state.domainFieldValue === this.currentSiteSlug;

		return (
			<div className="simple-site-rename-form">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ this.state.domainFieldValue }
					currentDomainName={ this.currentSiteSlug }
					onConfirm={ this.onConfirm }
				/>
				<form onSubmit={ this.onSubmit }>
					<Card className="simple-site-rename-form__content">
						<FormSectionHeading>{ translate( 'Edit Domain Name' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							type="text"
							value={ this.state.domainFieldValue }
							suffix={ '.wordpress.com' }
							onChange={ this.onFieldChange }
							placeholder={ this.currentSiteSlug }
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
				isSiteRenameRequesting: isRequestingSiteRename( state, siteId ),
				nonce: 'bogus-nonce-get-this-out-of-the-state-tree-instead',
				selectedSiteId: siteId,
			};
		},
		{
			requestPreflight,
			requestSiteRename,
		}
	)
)( SimpleSiteRenameForm );
