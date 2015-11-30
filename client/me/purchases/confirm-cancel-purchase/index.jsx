/**
 * External Dependencies
 **/
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import Card from 'components/card';
import ConfirmCancelPurchaseLoadingPlaceholder from './loading-placeholder';
import HeaderCake from 'components/header-cake';
import { initializeForm, loadEndpointForm } from './load-endpoint-form';
import Main from 'components/main';
import notices from 'notices';
import paths from 'me/purchases/paths';
import titles from 'me/purchases/titles';
import { getPurchase, goToManagePurchase, recordPageView } from '../utils';

const ConfirmCancelPurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.object
	},

	getInitialState() {
		return {
			html: null
		};
	},

	componentWillMount() {
		this.loadEndpointForm();
		recordPageView( 'confirm_cancel_purchase', this.props );
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( ! prevState.html && this.state.html ) {
			const container = React.findDOMNode( this.refs.root );

			container.innerHTML = this.state.html;
			initializeForm( {
				form: container.querySelector( 'form' ),
				onSubmit: this.handleSubmit,
				selectedPurchase: getPurchase( this.props ),
				selectedSite: this.props.selectedSite
			} );
		}
	},

	loadEndpointForm() {
		loadEndpointForm( getPurchase( this.props ), ( html ) => {
			this.setState( {
				html
			} );
		} );
	},

	handleSubmit( error, response ) {
		if ( error ) {
			notices.error( error.message );
			return;
		}

		notices.success( response.message, { persistent: true } );

		analytics.tracks.recordEvent(
			'calypso_purchases_cancel_form_submit',
			{ product_slug: getPurchase( this.props ).productSlug }
		);

		page.redirect( paths.list() );
	},

	render() {
		if ( ! this.state.html ) {
			return <ConfirmCancelPurchaseLoadingPlaceholder
				purchaseId={ this.props.purchaseId }
				selectedSite={ this.props.selectedSite } />;
		}

		return (
			<Main className="cancel-confirm">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
					{ titles.confirmCancelPurchase }
				</HeaderCake>
				<Card>
					<div ref="root"></div>
				</Card>
			</Main>
		);
	}
} );

export default ConfirmCancelPurchase;
