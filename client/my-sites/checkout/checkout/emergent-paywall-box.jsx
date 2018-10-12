/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import classNames from 'classnames';
import { get, isEqual, debounce, startsWith, isBoolean } from 'lodash';
import { connect } from 'react-redux';
import { localize, translate } from 'i18n-calypso';
import debug from 'debug';

/**
 * Internal dependencies
 */
import notices from 'notices';
import TermsOfService from './terms-of-service';
import wp from 'lib/wp';
import { paymentMethodName, paymentMethodClassName } from 'lib/cart-values';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { CALYPSO_CONTACT } from 'lib/url/support';

const wpcom = wp.undocumented();
const log = debug( 'calypso:checkout:payment:emergent-payall' );

export class EmergentPaywallBox extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		transaction: PropTypes.object.isRequired,
	};

	static defaultProps = {
		selectedSite: {},
	};

	constructor( props ) {
		super( props );
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
			paymentMethod: paymentMethodClassName( 'emergent-paywall' ),
			payload: '',
			charge_id: '',
			signature: '',
			iframeHeight: 600,
			iframeWidth: 750,
			hasConfigLoaded: false,
			redirectTo: '',
			pendingOrder: false,
			siteSlug: this.props.selectedSite ? this.props.selectedSite.slug : 'no-site',
		};
	}

	errorMessage = () => {
		const contactLink = <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />;

		return translate(
			'Oops! Something went wrong and your request could not be ' +
				'processed. Please try again or {{contactLink}}Contact Support{{/contactLink}} if ' +
				'you continue to have trouble.',
			{ components: { contactLink } }
		);
	};

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

		if ( isBoolean( purchaseStatus.success ) ) {
			if ( true === purchaseStatus.success ) {
				log( 'Paywall purchase success' );
				return this.handlePaywallSuccess();
			}
		}

		if ( isBoolean( purchaseStatus.close ) ) {
			log( 'User has closed the iframe' );

			// Resize the iframe to prevent Emergent's error message from showing.
			this.setState( {
				iframeHeight: 1,
				iframeWidth: 1,
			} );
			// Reload the iframe contents
			this.formRef.current.submit();
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
					this.props.onOrderCreated( {
						orderId: result.order_id,
						paymentMethod: this.state.paymentMethod,
						siteSlug: this.state.siteSlug,
					} );
				}
			} )
			.catch( error => {
				log( 'Error creating order: ', error, error.message || '' );

				notices.error( this.errorMessage() );
				this.fetchIframeConfiguration();
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

	fetchIframeConfiguration = () => {
		wpcom.emergentPaywallConfiguration(
			this.props.userCountryCode,
			this.props.cart,
			this.props.transaction.domainDetails,
			this.loadIframe
		);
	};

	loadIframe = ( error, iframeConfig ) => {
		if ( error ) {
			notices.error( this.errorMessage() );
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
		const { payload, paywall_url, signature, iframeHeight, hasConfigLoaded } = this.state;
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

export default connect(
	state => ( {
		userCountryCode: getCurrentUserCountryCode( state ),
	} ),
	dispatch => ( {
		onOrderCreated: ( { orderId, paymentMethod, siteSlug } ) => {
			dispatch(
				recordTracksEvent( 'calypso_checkout_form_submit', { payment_method: paymentMethod } )
			);
			page.redirect( `/checkout/thank-you/${ siteSlug }/pending/${ orderId }` );
		},
	} )
)( localize( EmergentPaywallBox ) );
