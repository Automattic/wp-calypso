import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { withShoppingCart } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DomainProductPrice from 'calypso/components/domains/domain-product-price';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { hasProduct, siteRedirect } from 'calypso/lib/cart-values/cart-items';
import { canRedirect } from 'calypso/lib/domains';
import { withoutHttp } from 'calypso/lib/url';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';

import './site-redirect-step.scss';

class SiteRedirectStep extends Component {
	static propTypes = {
		products: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
	};

	state = { searchQuery: '', isSubmitting: false };

	isMounted = false;

	componentWillUnmount() {
		this.isMounted = false;
	}

	componentDidMount() {
		this.isMounted = true;
	}

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
							busy={ this.state.isSubmitting }
							disabled={ this.state.isSubmitting }
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

		this.setState( { isSubmitting: true } );

		const domain = this.state.searchQuery;

		this.props.recordFormSubmit( domain );

		if ( hasProduct( this.props.cart, 'offsite_redirect' ) ) {
			this.props.errorNotice(
				this.getValidationErrorMessage( domain, { code: 'already_in_cart' } )
			);
			this.setState( { isSubmitting: false } );
			return;
		}

		canRedirect( this.props.selectedSite.ID, domain, ( error ) => {
			if ( error ) {
				this.props.errorNotice( this.getValidationErrorMessage( domain, error ) );
				this.setState( { isSubmitting: false } );
				return;
			}

			this.addSiteRedirectToCart( domain );
		} );
	};

	addSiteRedirectToCart = async ( domain ) => {
		try {
			await this.props.shoppingCartManager.addProductsToCart( [ siteRedirect( { domain } ) ] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return;
		}
		this.isMounted && page( '/checkout/' + this.props.selectedSite.slug );
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
} )( withCartKey( withShoppingCart( localize( SiteRedirectStep ) ) ) );
