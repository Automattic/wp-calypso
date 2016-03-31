/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import Card from 'components/card';
import { clearPurchases } from 'lib/upgrades/actions';
import ConfirmCancelPurchaseLoadingPlaceholder from './loading-placeholder';
import HeaderCake from 'components/header-cake';
import { getName } from 'lib/purchases';
import { getPurchase, goToCancelPurchase, recordPageView } from '../utils';
import loadEndpointForm from './load-endpoint-form';
import Main from 'components/main';
import notices from 'notices';
import paths from 'me/purchases/paths';
import titles from 'me/purchases/titles';

const ConfirmCancelPurchase = React.createClass( {
	propTypes: {
		purchaseId: React.PropTypes.string.isRequired,
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ).isRequired
	},

	getInitialState() {
		return {
			isFormLoaded: false
		};
	},

	componentWillMount() {
		this.loadEndpointForm();
		recordPageView( 'confirm_cancel_purchase', this.props );
	},

	loadEndpointForm() {
		const purchase = getPurchase( this.props );

		loadEndpointForm( purchase, ( html, initializeForm ) => {
			if ( ! this.isMounted() ) {
				return;
			}

			this.setState( { isFormLoaded: true }, () => {
				const container = ReactDom.findDOMNode( this.refs.root );

				container.innerHTML = html;
				initializeForm( {
					form: container.querySelector( 'form' ),
					onSubmit: this.handleSubmit,
					selectedPurchase: purchase,
					selectedSite: this.props.selectedSite
				} );
			} );
		} );
	},

	handleSubmit( error, response ) {
		if ( error ) {
			notices.error( error.message || this.translate( 'Unable to cancel your purchase. Please try again later or contact support.' ) );

			return;
		}

		const purchase = getPurchase( this.props ),
			purchaseName = getName( purchase );

		notices.success(
			this.translate( '%(purchaseName)s was successfully cancelled and refunded.', {
				args: { purchaseName }
			} ), { persistent: true } );

		clearPurchases();

		analytics.tracks.recordEvent(
			'calypso_purchases_cancel_form_submit',
			{ product_slug: getPurchase( this.props ).productSlug }
		);

		page.redirect( paths.list( this.props.selectedSite.slug ) );
	},

	render() {
		if ( ! this.state.isFormLoaded ) {
			return <ConfirmCancelPurchaseLoadingPlaceholder
				purchaseId={ this.props.purchaseId }
				selectedSite={ this.props.selectedSite } />;
		}

		return (
			<Main className="cancel-confirm">
				<HeaderCake onClick={ goToCancelPurchase.bind( null, this.props ) }>
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
