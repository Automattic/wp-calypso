/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { get, isEqual, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import notices from 'notices';
import analytics from 'lib/analytics';
import cartValues, { paymentMethodName } from 'lib/cart-values';
import TermsOfService from './terms-of-service';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

export class EmergentPaywallBox extends Component {
	static propTypes = {};

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
		};
	}

	onMessageReceiveHandler = event => {
		if ( event && event.origin === 'https://paypluseval.tfelements.com' ) {
			const message = get( JSON.parse( event.data ), 'message', {} );

			switch ( message.name ) {
				case 'WINDOW_SIZE':
					this.setState( {
						iframeHeight: message.payload.size.height,
						iframeWidth: message.payload.size.width,
					} );
					break;
				case 'PURCHASE_STATUS':
					if ( 'submitted' in message ) {
						//Submit order
					} else if ( 'success' in message ) {
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
