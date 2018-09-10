/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import classNames from 'classnames';
import { get, noop, startsWith, isBoolean } from 'lodash';
import { connect } from 'react-redux';
import { localize, translate } from 'i18n-calypso';
import debug from 'debug';

/**
 * Internal dependencies
 */
import TermsOfService from './terms-of-service';
import { convertToSnakeCase } from 'state/data-layer/utils';
import { paymentMethodName, paymentMethodClassName } from 'lib/cart-values';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { CALYPSO_CONTACT } from 'lib/url/support';
import { errorNotice, removeNotice as removeNoticeAction } from 'state/notices/actions';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

const log = debug( 'calypso:checkout:payment:emergent-payall' );
const emergentPaywallIframeConfigLookupKey = 'emergent-paywall-iframe-config';
const emergentPaywallOrderLookupKey = 'emergent-paywall-prepare-order';

export class EmergentPaywallBox extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		transaction: PropTypes.object.isRequired,
	};

	static defaultProps = {
		selectedSite: {},
		iframeConfig: {
			chargeId: '',
			payload: '',
			paywallUrl: '',
			signature: '',
		},
		isIframeRequesting: false,
		iframeRequestFailed: false,
		iframeRequestSuccess: false,
		userCountryCode: '',
		orderId: null,
		orderErrorMessage: '',
		isOrderRequesting: false,
		orderRequestFailed: false,
		orderRequestSuccess: false,
		translate: noop,
	};

	constructor( props ) {
		super( props );
		this.state = this.getInitialState();
		this.iframeRef = React.createRef();
		this.formRef = React.createRef();
	}

	getInitialState() {
		return {
			paymentMethod: paymentMethodClassName( 'emergent-paywall' ),
			iframeHeight: 600,
			iframeWidth: 750,
			purchaseStatus: '',
			siteSlug: this.props.selectedSite ? this.props.selectedSite.slug : 'no-site',
		};
	}

	componentDidMount() {
		this.props.fetchIframeConfig( this.props.userCountryCode );
		window.addEventListener( 'message', this.onMessageReceiveHandler, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessageReceiveHandler );
	}

	componentDidUpdate( prevProps ) {
		// The cart's contents have changed. We fetch the iframe again.
		if (
			this.props.cart.products.length &&
			( prevProps.cart.total_cost !== this.props.cart.total_cost ||
				prevProps.cart.products.length !== this.props.cart.products.length )
		) {
			return this.fetchIframeConfiguration();
		}

		// We have successfully fetched the iframe config. We can load the iframe via the form.
		if (
			this.props.iframeRequestSuccess &&
			prevProps.iframeConfig.signature !== this.props.iframeConfig.signature
		) {
			return this.formRef.current.submit();
		}

		if ( this.props.iframeRequestFailed ) {
			log( 'Error fetching Paywall iframe: ', this.props.iframeConfigError );
			return this.handleTransactionError();
		}

		// We have successfully created an order.
		if (
			this.props.orderRequestSuccess &&
			this.props.orderId &&
			this.state.purchaseStatus === 'success'
		) {
			log( 'Paywall Order created. Order ID is: ' + this.props.orderId );
			return this.props.onOrderCreated( {
				orderId: this.props.orderId,
				paymentMethod: this.state.paymentMethod,
				siteSlug: this.state.siteSlug,
			} );
		}

		if ( this.props.orderRequestFailed ) {
			log( 'Error creating Paywall order: ', this.props.orderError );
			return this.handleTransactionError();
		}
	}

	fetchIframeConfiguration() {
		if ( ! this.props.isIframeRequesting ) {
			this.props.removeNotice( emergentPaywallIframeConfigLookupKey );
			this.props.fetchIframeConfig( this.props.userCountryCode );
		}
	}

	handleTransactionError() {
		const contactLink = <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />;
		this.props.showErrorNotice(
			translate(
				'Oops! Something went wrong and your request could not be ' +
					'processed. Please try again or {{contactLink}}Contact Support{{/contactLink}} if ' +
					'you continue to have trouble.',
				{ components: { contactLink } }
			),
			{
				id: emergentPaywallIframeConfigLookupKey,
			}
		);
		return this.fetchIframeConfiguration();
	}

	/**
	 * Determines what to do after a `PURCHASE_STATUS` message
	 *
	 * @param {Object} purchaseStatus - the status
	 * @return {Function?} whichever action is triggered
	 */
	handlePurchaseStatusMessage( purchaseStatus ) {
		if ( isBoolean( purchaseStatus.submitted ) ) {
			log( 'Preparing Paywall Order' );
			this.setState( {
				purchaseStatus: 'submitted',
			} );
			return this.props.fetchOrder( {
				paymentMethod: this.state.paymentMethod,
				paymentKey: this.props.iframeConfig.chargeId,
			} );
		}

		if ( true === purchaseStatus.success ) {
			log( 'Paywall purchase success' );
			this.setState( {
				purchaseStatus: 'success',
			} );
		}

		if ( isBoolean( purchaseStatus.close ) ) {
			log( 'User has closed the Paywall iframe' );

			// Resize the iframe to prevent Emergent's error message from showing.
			this.setState( {
				iframeHeight: 1,
				iframeWidth: 1,
				purchaseStatus: 'close',
			} );

			// Reload the iframe contents
			this.formRef.current.submit();
		}
	}

	onMessageReceiveHandler = event => {
		if ( event && startsWith( this.props.iframeConfig.paywallUrl, event.origin ) ) {
			const message = get( JSON.parse( event.data ), 'message', {} );
			log( 'Received event from Emergent Paywall:', message );
			switch ( message.name ) {
				case 'WINDOW_SIZE':
					return this.setState( {
						iframeHeight: message.payload.size.height,
						iframeWidth: message.payload.size.width,
					} );
				case 'PURCHASE_STATUS':
					return this.handlePurchaseStatusMessage( {
						close: message.close,
						success: message.success,
						submitted: message.submitted,
					} );
			}
		}
	};

	renderLoadingBlock() {
		return (
			<div className="checkout__emergent-paywall-loading loading-placeholder">
				<div className="checkout__emergent-paywall-loading-content loading-placeholder__content" />
			</div>
		);
	}

	onSubmitFormHandler( event ) {
		event.preventDefault();
	}

	render() {
		const {
			iframeConfig: { payload, signature, paywallUrl },
			iframeRequestSuccess,
		} = this.props;
		const { iframeHeight } = this.state;
		const iframeContainerClasses = classNames( 'checkout__emergent-paywall-frame-container', {
			'is-iframe-loaded': iframeRequestSuccess,
		} );

		return (
			<div>
				<TermsOfService />
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">{ this.props.children }</div>
					{ ! iframeRequestSuccess && this.renderLoadingBlock() }
					<div className={ iframeContainerClasses }>
						<form
							className="checkout__emergent-paywall-form"
							onSubmit={ this.onSubmitFormHandler }
							ref={ this.formRef }
							name="emergent-paywall-get-iframe-contents"
							target="emergent-paywall-iframe"
							action={ paywallUrl }
							method="POST"
						>
							<input type="hidden" name="payload" value={ payload } />
							<input type="hidden" name="signature" value={ signature } />
						</form>
						<iframe
							height={ iframeHeight }
							name="emergent-paywall-iframe"
							title={ paymentMethodName[ 'emergent-paywall' ] }
							ref={ this.iframeRef }
							className="checkout__emergent-paywall-iframe"
						/>
						<div className="checkout__emergent-paywall-support-link">
							<a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer">
								{ translate( 'Contact Support' ) }
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

/**
 * POST emergent paywall iframe client configuration
 *
 * @param {object} postData  { cart, domainDetails, country }
 * @return {*} Stored data container for request.
 */
export const requestEmergentPaywallIframeConfiguration = postData => {
	const body = convertToSnakeCase( postData );
	return requestHttpData(
		emergentPaywallIframeConfigLookupKey,
		http( {
			apiVersion: '1.1',
			body,
			method: 'POST',
			path: '/me/emergent-paywall-configuration',
		} ),
		{
			fromApi: () => ( { charge_id, payload, paywall_url, signature } ) => [
				[
					emergentPaywallIframeConfigLookupKey,
					{ chargeId: charge_id, payload, paywallUrl: paywall_url, signature },
				],
			],
			freshness: -Infinity,
		}
	);
};

/**
 * POST emergent paywall transaction order
 *
 * @param {object} postData  { cart, domainDetails, payment }
 * @return {*} Stored data container for request.
 */
export const requestEmergentPaywallOrder = postData => {
	const body = convertToSnakeCase( postData );
	const id = `${ emergentPaywallOrderLookupKey }-${ postData.payment.paymentKey }`;
	return requestHttpData(
		`${ emergentPaywallOrderLookupKey }-${ postData.payment.paymentKey }`,
		http( {
			path: '/me/transactions',
			apiVersion: '1.1',
			method: 'POST',
			body,
		} ),
		{
			fromApi: () => ( { order_id } ) => [ [ id, { orderId: order_id } ] ],
			freshness: -Infinity,
		}
	);
};

const mapStateToProps = state => {
	const iframeConfig = getHttpData( emergentPaywallIframeConfigLookupKey ) || {};
	const order =
		getHttpData(
			`${ emergentPaywallOrderLookupKey }-${ get( iframeConfig, 'data.chargeId', '' ) }`
		) || {};

	return {
		iframeConfig: iframeConfig.data,
		iframeConfigError: iframeConfig.error,
		isIframeRequesting: 'pending' === iframeConfig.state,
		iframeRequestFailed: 'failure' === iframeConfig.state,
		iframeRequestSuccess: 'success' === iframeConfig.state,
		orderError: order.error,
		orderId: get( order, 'data.orderId', null ),
		isOrderRequesting: 'pending' === order.state,
		orderRequestFailed: 'failure' === order.state,
		orderRequestSuccess: 'success' === order.state,
		userCountryCode: getCurrentUserCountryCode( state ),
	};
};

const mapDispatchToProps = ( dispatch, { cart, transaction } ) => ( {
	fetchIframeConfig: country =>
		requestEmergentPaywallIframeConfiguration( {
			cart,
			domainDetails: transaction.domainDetails,
			country,
		} ),
	fetchOrder: payment =>
		requestEmergentPaywallOrder( {
			cart,
			domainDetails: transaction.domainDetails,
			payment,
		} ),
	onOrderCreated: ( { orderId, paymentMethod, siteSlug } ) => {
		dispatch(
			recordTracksEvent( 'calypso_checkout_form_submit', { payment_method: paymentMethod } )
		);
		page.redirect( `/checkout/thank-you/${ siteSlug }/pending/${ orderId }` );
	},
	showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
	removeNotice: noticeId => dispatch( removeNoticeAction( noticeId ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( EmergentPaywallBox ) );
