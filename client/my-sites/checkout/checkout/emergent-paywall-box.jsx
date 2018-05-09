/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import classNames from 'classnames';
import { assign, get, isEqual, debounce } from 'lodash';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import notices from 'notices';
import analytics from 'lib/analytics';
import { paymentMethodName, paymentMethodClassName, getLocationOrigin } from 'lib/cart-values';
import TermsOfService from './terms-of-service';
import wp from 'lib/wp';

const wpcom = wp.undocumented();
const log = debug( 'calypso:checkout:payment:emergent-payall' );

export class EmergentPaywallBox extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
	};

	constructor() {
		super();
		this.state = this.getInitialState();
		this.iframeRef = React.createRef();
		this.formRef = React.createRef();
		this.fetchIframeConfiguration = debounce( this.fetchIframeConfiguration, 500 );
	}

	componentDidMount() {
		this.fetchIframeConfiguration();
		window.addEventListener( 'message', this.onMessageReceiveHandler, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessageReceiveHandler );
	}

	componentDidUpdate( prevProps ) {
		if ( ! isEqual( prevProps.cart.total_cost, this.props.cart.total_cost ) ) {
			this.fetchIframeConfiguration();
		}
	}

	getInitialState() {
		return {
			paywall_url: '',
			payload: '',
			signature: '',
			iframeHeight: 600,
			iframeWidth: 750,
			hasConfigLoaded: false,
			redirectTo: '',
		};
	}

	onMessageReceiveHandler = event => {
		if ( event && event.origin === 'https://paypluseval.tfelements.com' ) {
			const message = get( JSON.parse( event.data ), 'message', {} );
			log( 'Received event from Emergent Paywall:', message );

			switch ( message.name ) {
				case 'WINDOW_SIZE':
					this.setState( {
						iframeHeight: message.payload.size.height,
						iframeWidth: message.payload.size.width,
					} );
					break;
				case 'PURCHASE_STATUS':
					if ( 'submitted' in message ) {
						this.prepareOrder();
					} else if ( 'success' in message ) {
						//TODO: delay until this.state.redirectTo is not empty if it is
						if ( message.success && this.state.redirectTo !== '' ) {
							page( this.state.redirectTo );
						}
						// message.success ? 'success' : 'failure'
					} else if ( 'close' in message ) {
						//closed
					}
					break;
				default:
					break;
			}
		}
	};

	prepareOrder() {
		let cancelPath = '/checkout/';
		let successPath = '/checkout/thank-you/';

		if ( this.props.selectedSite ) {
			cancelPath += this.props.selectedSite.slug;
			successPath += this.props.selectedSite.slug;
		} else {
			cancelPath += 'no-site';
			successPath += this.props.selectedSite.slug;
		}

		successPath += '/pending/';

		const origin = getLocationOrigin( location );
		const cancelUrl = origin + cancelPath;
		const successUrl = origin + successPath;

		const dataForApi = {
			payment: assign( {}, this.state, {
				paymentMethod: paymentMethodClassName( 'emergent-paywall' ),
				successUrl: successUrl,
				cancelUrl,
			} ),
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails,
		};

		log( 'Preparing Order' );

		// get the redirect URL from rest endpoint
		wpcom.transactions(
			'POST',
			dataForApi,
			function( error, result ) {
				let errorMessage;
				if ( error ) {
					log( 'Error creating order: ', error );

					if ( error.message ) {
						errorMessage = error.message;
					} else {
						errorMessage = translate( "We've encountered a problem. Please try again later." );
					}
					log( 'Error message: ' + errorMessage );
					// TODO: This shouldn't happen, but if it does, what can we do?
				} else if ( result.order_id ) {
					log( 'Order created. Order ID is: ' + result.order_id );
					analytics.tracks.recordEvent( 'calypso_checkout_with_emergent_paywall' );
					this.setState( { redirectTo: successPath + result.order_id } );
				}
			}.bind( this )
		);
	}

	fetchIframeConfiguration = () => {
		notices.clearNotices( 'notices' );
		wpcom.emergentPaywellConfiguration( 'IN', this.props.cart, this.loadIframe );
	};

	loadIframe = ( error, iframeConfig ) => {
		if ( error ) {
			notices.error( this.props.translate( "There's been an error. Please try again later." ) );
			this.setState( this.getInitialState() );
			return;
		}

		this.setState(
			{
				hasConfigLoaded: true,
				...iframeConfig,
			},
			() => {
				this.formRef.current.submit();
			}
		);
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
			payload,
			paywall_url,
			signature,
			iframeHeight,
			iframeWidth,
			hasConfigLoaded,
		} = this.state;
		const iframeContainerClasses = classNames( 'checkout__emergent-paywall-frame-container', {
			'iframe-loaded': hasConfigLoaded,
		} );
		return (
			<div>
				<TermsOfService />
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">{ this.props.children }</div>
					{ ! hasConfigLoaded && this.renderLoadingBlock() }
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
							width={ iframeWidth }
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

export default localize( EmergentPaywallBox );
