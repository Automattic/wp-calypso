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
			iframeConfig: null,
		};
		this.iframeRef = React.createRef();
	}

	componentDidMount() {
		this.fetchIframeConfiguration();
	}

	fetchIframeConfiguration = () => {
		wpcom.emergentPaywellConfiguration(
			'IN',
			this.props.cart,
			this.loadIframe
		);
	}

	loadIframe( error, iframeConfig ) {
		// eslint-disable-next-line
		console.log( 'iframeConfig', iframeConfig );
	}

	renderIframe() {
		return this.state.iframeConfig
			? ( <iframe
				title={ paymentMethodName[ 'emergent-paywall' ] }
				ref={ this.iframeRef }
				className="checkout__emergent-paywall-iframe"
				src={ this.state.iframeConfig.paywall_url }
			/> )
			: null;
	}

	onSubmitFormHandler() {}

	render() {
		return (
			<form onSubmit={ this.onSubmitFormHandler }>
				<TermsOfService />
				<div className="checkout__payment-box-sections">
					<div className="checkout__payment-box-section">
						{ this.props.children }

					</div>
				</div>
			</form>
		);
	}
}

export default localize( EmergentPaywallBox );