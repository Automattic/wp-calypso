/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import debug from 'debug';
import React, { Component } from 'react';
import page from 'page';
import classNames from 'classnames';
import { get, startsWith, isBoolean } from 'lodash';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import TermsOfService from './terms-of-service';
import wp from 'lib/wp';
import { paymentMethodName, paymentMethodClassName } from 'lib/cart-values';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

const wpcom = wp.undocumented();
const log = debug( 'calypso:checkout:payment:emergent-payall' );
const emergentPaywallLookupKey = 'emergent-paywall-config';

export class EmergentPaywallBox extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		transaction: PropTypes.object.isRequired,
		fetchIframeConfig: PropTypes.func.isRequired,
		iframeConfig: PropTypes.object,
		iframeConfigRequestState: PropTypes.string,
		showErrorNotice: PropTypes.func.isRequired,
		removeNotice: PropTypes.func.isRequired,
	};

	static defaultProps = {
		selectedSite: {},
		iframeConfig: {
			paywall_url: '',
			payload: '',
			charge_id: '',
			signature: '',
		},
		iframeConfigRequestState: '',
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
			redirectTo: '',
			pendingOrder: false,
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
		if (
			prevProps.cart.total_cost !== this.props.cart.total_cost ||
			prevProps.cart.products.length !== this.props.cart.products.length
		) {
			this.props.removeNotice( emergentPaywallLookupKey );
			return this.props.fetchIframeConfig( this.props.userCountryCode );
		}

		if (
			this.props.iframeConfigRequestState === 'success' &&
			prevProps.iframeConfig.signature !== this.props.iframeConfig.signature
		) {
			return this.formRef.current.submit();
		}

		if ( this.props.iframeConfigRequestState === 'failure' ) {
			return this.props.showErrorNotice(
				translate( "There's been an error. Please try again later." ),
				{
					id: emergentPaywallLookupKey,
				}
			);
		}
	}
	/**
	 * Determines what to do after a `PURCHASE_STATUS` message
	 *
	 * @param {Object} purchaseStatus - the status
	 * @return {Function?} whichever action is triggered
	 */
	handlePurchaseStatusMessage( purchaseStatus ) {
		if ( isBoolean( purchaseStatus.submitted ) ) {
			log( 'Setting state.pendingOrder to the prepareOrder promise' );
			return this.setState( { pendingOrder: this.prepareOrder() } );
		}

		if ( true === purchaseStatus.success ) {
			log( 'Paywall purchase success' );
			return this.handlePaywallSuccess();
		}

		if ( isBoolean( purchaseStatus.close ) ) {
			log( 'User has closed the iframe' );
			return page.redirect( `/plans/${ this.state.siteSlug }` );
		}
	}

	onMessageReceiveHandler = event => {
		if ( event && startsWith( this.state.paywall_url, event.origin ) ) {
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

	handlePaywallSuccess() {
		this.state.pendingOrder
			.then( result => {
				if ( result.order_id ) {
					log( 'Order created. Order ID is: ' + result.order_id );
					const successPath = `/checkout/thank-you/${ this.state.siteSlug }/pending/${
						result.order_id
					}`;
					analytics.tracks.recordEvent( 'calypso_checkout_form_submit', {
						payment_method: this.state.paymentMethod,
					} );
					page.redirect( successPath );
				}
			} )
			.catch( error => {
				log(
					'Error creating order: ',
					error,
					error.message || translate( "We've encountered a problem. Please try again later." )
				);
				// TODO: This shouldn't happen, but if it does, what can we do?
				page.redirect( `/checkout/${ this.state.siteSlug }` );
			} );
	}

	prepareOrder() {
		const dataForApi = {
			payment: {
				paymentMethod: this.state.paymentMethod,
				paymentKey: this.state.charge_id,
			},
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails,
		};

		log( 'Preparing Order' );

		// get the order ID from rest endpoint
		return wpcom.transactions( 'POST', dataForApi );
	}

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
			iframeConfig: { payload, signature, paywall_url },
			iframeConfigRequestState,
		} = this.props;
		const { iframeHeight } = this.state;
		const isRequestStateSuccessful = iframeConfigRequestState === 'success';
		const iframeContainerClasses = classNames( 'checkout__emergent-paywall-frame-container', {
			'iframe-loaded': isRequestStateSuccessful,
		} );

		return (
			<div>
				<TermsOfService />
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">{ this.props.children }</div>
					{ ! isRequestStateSuccessful && this.renderLoadingBlock() }
					<div className={ iframeContainerClasses }>
						<form
							className="checkout__emergent-paywall-form"
							onSubmit={ this.onSubmitFormHandler }
							ref={ this.formRef }
							name="emergent-paywall-get-iframe-contents"
							target="emergent-paywall-iframe"
							action={ paywall_url }
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
					</div>
				</div>
			</div>
		);
	}
}

/**
 * POST emergent paywall iframe client configuration
 *
 * @param {object} cart - current cart object. See: client/lib/cart/store/index.js
 * @param {object} domainDetails - transaction store domain details
 * @param {string} country - user's country code
 *
 * @return {*} Stored data container for request.
 */
export const requestEmergentPaywallConfiguration = ( cart, domainDetails, country ) => {
	return requestHttpData(
		emergentPaywallLookupKey,
		http( {
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/emergent-paywall-configuration',
			body: { cart, domainDetails, country },
		} ),
		{
			fromApi: () => config => [ [ 'config', config ] ],
			freshness: -Infinity,
		}
	);
};

export default connect(
	state => ( {
		userCountryCode: getCurrentUserCountryCode( state ),
		iframeConfig: getHttpData( emergentPaywallLookupKey ).data,
		iframeConfigRequestState: getHttpData( emergentPaywallLookupKey ).state,
	} ),
	( dispatch, { cart, transaction } ) => ( {
		fetchIframeConfig: country =>
			requestEmergentPaywallConfiguration( cart, transaction.domainDetails, country ),
		showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
		removeNotice: noticeId => dispatch( removeNotice( noticeId ) ),
	} )
)( EmergentPaywallBox );
