/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProductPrice extends React.Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		price: PropTypes.string,
		salePrice: PropTypes.string,
	};

	static defaultProps = {
		isMappingProduct: false,
	};

	renderContentText() {
		const message = this.props.translate( 'Free for first three months' );

		return <div className="email-product-price__free-text">{ message }</div>;
	}

	renderContentPrice() {
		const threeMonths = 86400 * 90 * 10000;
		const startDate = Date.now() + threeMonths;

		const priceText = this.props.translate( '%(cost)s per month starting %(starts)s', {
			args: { cost: this.props.price, starts: startDate },
		} );

		return <div className="email-product-price__price">{ priceText }</div>;
	}

	renderContent() {
		const className = classnames( 'email-product-price', 'is-free-domain', {
			'email-product-price__email-step-signup-flow': this.props.showStrikedOutPrice,
		} );
		return (
			<div className={ className }>
				{ this.renderContentText() }
				{ this.renderContentPrice() }
			</div>
		);
	}

	render() {
		if ( this.props.isLoading ) {
			return (
				<div className="email-product-price is-placeholder">
					{ this.props.translate( 'Loading…' ) }
				</div>
			);
		}

		return this.renderContent();
	}
}

export default localize( EmailProductPrice );
