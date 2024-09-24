import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import DomainProductPrice from 'calypso/components/domains/domain-product-price';

import './style.scss';

class DomainSuggestion extends Component {
	static propTypes = {
		buttonContent: PropTypes.node.isRequired,
		buttonStyles: PropTypes.object,
		extraClasses: PropTypes.string,
		onButtonClick: PropTypes.func.isRequired,
		premiumDomain: PropTypes.object,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		renewPrice: PropTypes.string,
		domain: PropTypes.string,
		hidePrice: PropTypes.bool,
		showChevron: PropTypes.bool,
		isAdded: PropTypes.bool,
	};

	static defaultProps = {
		showChevron: false,
	};

	renderPrice() {
		const {
			hidePrice,
			premiumDomain,
			price,
			renewPrice,
			priceRule,
			salePrice,
			isSignupStep,
			showStrikedOutPrice,
			isReskinned,
		} = this.props;

		if ( hidePrice ) {
			return null;
		}

		if ( premiumDomain?.pending ) {
			return <div className="domain-suggestion__price-placeholder" />;
		}

		return (
			<DomainProductPrice
				price={ price }
				renewPrice={ renewPrice }
				salePrice={ salePrice }
				rule={ priceRule }
				isSignupStep={ isSignupStep }
				showStrikedOutPrice={ showStrikedOutPrice }
				isReskinned={ isReskinned }
			/>
		);
	}

	render() {
		const { children, extraClasses, isAdded, isFeatured, showStrikedOutPrice, isReskinned } =
			this.props;
		const classes = clsx(
			'domain-suggestion',
			'card',
			'is-compact',
			'is-clickable',
			{
				'is-added': isAdded,
			},
			extraClasses
		);

		const contentClassName = clsx( 'domain-suggestion__content', {
			'domain-suggestion__content-domain': showStrikedOutPrice && ! isFeatured,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/interactive-supports-focus */
		return (
			<div
				className={ classes }
				onClick={ () => {
					this.props.onButtonClick( isAdded );
				} }
				data-tracks-button-click-source={ this.props.tracksButtonClickSource }
				role="button"
				data-e2e-domain={ this.props.domain }
			>
				<div className={ contentClassName }>
					{ children }
					{ ( isReskinned || ! isFeatured ) && this.renderPrice() }
				</div>
				{ ! isReskinned && isFeatured && (
					<div className="domain-suggestion__price-container">{ this.renderPrice() }</div>
				) }
				<div className="domain-suggestion__action-container">
					<Button className="domain-suggestion__action" { ...this.props.buttonStyles }>
						{ this.props.buttonContent }
					</Button>
				</div>
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
