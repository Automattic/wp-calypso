/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import { Button } from '@automattic/components';
import { hasProduct, siteRedirect } from 'lib/cart-values/cart-items';
import { errorNotice } from 'state/notices/actions';
import { canRedirect } from 'lib/domains';
import DomainProductPrice from 'components/domains/domain-product-price';
import { addItem } from 'lib/cart/actions';
import { recordGoogleEvent } from 'state/analytics/actions';
import { withoutHttp } from 'lib/url';

/**
 * Style dependencies
 */
import './site-redirect-step.scss';

class SiteRedirectStep extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		products: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
	};

	state = { searchQuery: '' };

	render() {
		const price = get( this.props, 'products.offsite_redirect.cost_display', null );
		const { translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="site-redirect-step">
				<form className="site-redirect-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="site-redirect-step__domain-description">
						<p>
							{ translate( 'Redirect {{strong}}%(domain)s{{/strong}} to this domain', {
								components: { strong: <strong /> },
								args: { domain: this.props.selectedSite.slug },
							} ) }
						</p>
					</div>

					<DomainProductPrice price={ price } requiresPlan={ false } />

					<FormFieldset>
						<FormTextInput
							className="site-redirect-step__external-domain"
							value={ this.state.searchQuery }
							placeholder={ translate( 'Enter a domain', { textOnly: true } ) }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
						/>
						<Button
							primary
							className="site-redirect-step__go"
							type="submit"
							onClick={ this.recordGoButtonClick }
						>
							{ translate( 'Go', {
								context: 'Upgrades: Label for adding Site Redirect',
							} ) }
						</Button>
					</FormFieldset>
				</form>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	recordInputFocus = () => {
		this.props.recordInputFocus( this.state.searchQuery );
	};

	recordGoButtonClick = () => {
		this.props.recordGoButtonClick( this.state.searchQuery );
	};

	setSearchQuery = ( event ) => {
		this.setState( { searchQuery: withoutHttp( event.target.value ) } );
	};

	handleFormSubmit = ( event ) => {
		event.preventDefault();

		const domain = this.state.searchQuery;

		this.props.recordFormSubmit( domain );

		if ( hasProduct( this.props.cart, 'offsite_redirect' ) ) {
			this.props.errorNotice(
				this.getValidationErrorMessage( domain, { code: 'already_in_cart' } )
			);
			return;
		}

		canRedirect(
			this.props.selectedSite.ID,
			domain,
			function ( error ) {
				if ( error ) {
					this.props.errorNotice( this.getValidationErrorMessage( domain, error ) );
					return;
				}

				this.addSiteRedirectToCart( domain );
			}.bind( this )
		);
	};

	addSiteRedirectToCart = ( domain ) => {
		addItem( siteRedirect( { domain } ) );
		page( '/checkout/' + this.props.selectedSite.slug );
	};

	getValidationErrorMessage = ( domain, error ) => {
		const { translate } = this.props;

		switch ( error.code ) {
			case 'invalid_domain':
				return translate( 'Sorry, %(domain)s does not appear to be a valid domain name.', {
					args: { domain: domain },
				} );

			case 'invalid_tld':
				return translate( 'Sorry, %(domain)s does not end with a valid domain extension.', {
					args: { domain: domain },
				} );

			case 'empty_query':
				return translate( 'Please enter a domain name or keyword.' );

			case 'has_subscription':
				return translate(
					"You already have Site Redirect upgrade and can't add another one to the same site."
				);

			case 'already_in_cart':
				return translate(
					"You already have Site Redirect upgrade in the Shopping Cart and can't add another one"
				);

			default:
				return translate( 'There is a problem adding Site Redirect that points to %(domain)s.', {
					args: { domain: domain },
				} );
		}
	};
}

const recordInputFocus = ( searchBoxValue ) =>
	recordGoogleEvent(
		'Domain Search',
		'Focused On Search Box Input in Site Redirect',
		'Search Box Value',
		searchBoxValue
	);

const recordGoButtonClick = ( searchBoxValue ) =>
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Go" Button in Site Redirect',
		'Search Box Value',
		searchBoxValue
	);

const recordFormSubmit = ( searchBoxValue ) =>
	recordGoogleEvent(
		'Domain Search',
		'Submitted Form in Site Redirect',
		'Search Box Value',
		searchBoxValue
	);

export default connect( null, {
	errorNotice,
	recordInputFocus,
	recordGoButtonClick,
	recordFormSubmit,
} )( localize( SiteRedirectStep ) );
