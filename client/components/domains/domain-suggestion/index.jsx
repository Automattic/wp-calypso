/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import DomainProductPrice from 'components/domains/domain-product-price';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class DomainSuggestion extends React.Component {
	static propTypes = {
		buttonContent: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] )
			.isRequired,
		buttonStyles: PropTypes.object,
		extraClasses: PropTypes.string,
		onButtonClick: PropTypes.func.isRequired,
		premiumDomain: PropTypes.object,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		domain: PropTypes.string,
		hidePrice: PropTypes.bool,
		showChevron: PropTypes.bool,
	};

	static defaultProps = {
		showChevron: false,
	};

	renderPrice() {
		const { hidePrice, premiumDomain, price, priceRule, salePrice, isSignupStep } = this.props;

		if ( hidePrice ) {
			return null;
		}

		if ( premiumDomain?.pending ) {
			return <div className="domain-suggestion__price-placeholder" />;
		}

		return (
			<DomainProductPrice
				price={ price }
				salePrice={ salePrice }
				rule={ priceRule }
				isSignupStep={ isSignupStep }
				selectedPaidPlanInSwapFlow={ this.props.selectedPaidPlanInSwapFlow }
			/>
		);
	}

	render() {
		const { children, extraClasses, isAdded, isFeatured, isSignupStep } = this.props;
		const classes = classNames(
			'domain-suggestion',
			'card',
			'is-compact',
			'is-clickable',
			{
				'is-added': isAdded,
			},
			extraClasses
		);

		const contentClassName = classNames( 'domain-suggestion__content', {
			'domain-suggestion__content-domain-copy-test': isSignupStep && ! isFeatured,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/interactive-supports-focus */
		return (
			<div
				className={ classes }
				onClick={ this.props.onButtonClick }
				data-tracks-button-click-source={ this.props.tracksButtonClickSource }
				role="button"
				data-e2e-domain={ this.props.domain }
			>
				<div className={ contentClassName }>
					{ children }
					{ this.renderPrice() }
				</div>
				<Button className="domain-suggestion__action" { ...this.props.buttonStyles }>
					{ this.props.buttonContent }
				</Button>
				{ this.props.showChevron && (
					<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
				) }
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events */
		/* eslint-enable jsx-a11y/interactive-supports-focus */
	}
}

DomainSuggestion.Placeholder = function () {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="domain-suggestion card is-compact is-placeholder is-clickable">
			<div className="domain-suggestion__content">
				<div />
			</div>
			<div className="domain-suggestion__action" />
			<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default DomainSuggestion;
