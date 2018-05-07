/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import Card from 'components/card';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import SectionHeader from 'components/section-header';
import analytics from 'lib/analytics';
import cartValues, { paymentMethodName } from 'lib/cart-values';
import TermsOfService from './terms-of-service';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

export class EmergentPaywallBox extends Component {
	constructor() {
		super();
		this.state = {
			paywall_url: null,
			payload: null,
			signature: null,
			iframeHeight: 600,
			iframeWidth: 750,
		};
		this.iframeRef = React.createRef();
		this.formRef = React.createRef();
	}

	componentDidMount() {
		this.fetchIframeConfiguration();
		window.addEventListener( 'message', this.onMessageReceiveHandler, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.onMessageReceiveHandler );
	}

	onMessageReceiveHandler = event => {
		if ( event.origin === 'https://paypluseval.tfelements.com' && event.data ) {
			const { name, payload } = event.data.message;

			switch ( name ) {
				case 'WINDOW_SIZE':
					this.setState( {
						iframeHeight: payload.size.height,
						iframeWidth: payload.size.width,
					} );
					break;
				case 'PURCHASE_STATUS':
					// initialized: true?
					// closed: true?
					break;
				default:
					break;
			}
		}
	};

	fetchIframeConfiguration = () => {
		wpcom.emergentPaywellConfiguration( 'IN', this.props.cart, this.loadIframe );
	};

	loadIframe = ( error, iframeConfig ) => {
		// eslint-disable-next-line
		console.log( 'iframeConfig', iframeConfig );
		this.setState( { ...iframeConfig }, () => {
			// eslint-disable-next-line
			console.log( 'this.formRef', this.formRef );
			this.formRef.current.submit();
		} );
	};

	renderIframe() {
		return this.state.iframeConfig ? (
			<iframe
				name="emergent-paywall-iframe"
				title={ paymentMethodName[ 'emergent-paywall' ] }
				ref={ this.iframeRef }
				className="checkout__emergent-paywall-iframe"
				src={ this.state.iframeConfig.paywall_url }
			/>
		) : null;
	}

	onSubmitFormHandler( event ) {
		event.preventDefault();
	}

	render() {
		const iframeClasses = classNames( {
			'checkout__emergent-paywall-iframe': !! this.state.paywall_url,
		} );
		return (
			<div>
				<TermsOfService />
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">{ this.props.children }</div>
				</div>
				<form
					onSubmit={ this.onSubmitFormHandler }
					ref={ this.formRef }
					name="emergent-paywall-get-iframe-contents"
					target="emergent-paywall-iframe"
					action={ this.state.paywall_url }
					method="POST"
				>
					<input type="hidden" name="payload" value={ this.state.payload } />
					<input type="hidden" name="signature" value={ this.state.signature } />
				</form>
				<iframe
					height={ this.state.iframeHeight }
					width={ this.state.iframeWidth }
					name="emergent-paywall-iframe"
					title={ paymentMethodName[ 'emergent-paywall' ] }
					ref={ this.iframeRef }
					className={ iframeClasses }
				/>
			</div>
		);
	}
}

export default localize( EmergentPaywallBox );
