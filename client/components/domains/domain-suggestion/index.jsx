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
import Button from 'components/button';

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
		priceRule: PropTypes.string,
		price: PropTypes.string,
		domain: PropTypes.string,
		hidePrice: PropTypes.bool,
		showChevron: PropTypes.bool,
	};

	static defaultProps = {
		showChevron: false,
	};

	renderDomainSuggestAction() {
		const className = classNames( 'domain-suggestion__action', {
			'domain-suggestion__action-domain-copy-test':
				this.props.showTestCopy && ! this.props.isFeatured,
		} );

		return (
			<Button className={ className } { ...this.props.buttonStyles }>
				{ this.props.buttonContent }
			</Button>
		);
	}

	render() {
		const {
			children,
			extraClasses,
			hidePrice,
			isAdded,
			price,
			priceRule,
			salePrice,
			showTestCopy,
			isFeatured,
		} = this.props;
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

		/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
		return (
			<div
				className={ classes }
				onClick={ this.props.onButtonClick }
				data-tracks-button-click-source={ this.props.tracksButtonClickSource }
				role="button"
				data-e2e-domain={ this.props.domain }
			>
				<div className="domain-suggestion__content">
					{ children }
					{ ! hidePrice && (
						<DomainProductPrice
							price={ price }
							salePrice={ salePrice }
							rule={ priceRule }
							showTestCopy={ showTestCopy }
						/>
					) }
					{ showTestCopy && ! isFeatured && this.renderDomainSuggestAction() }
				</div>
				{ ( ! showTestCopy || isFeatured ) && this.renderDomainSuggestAction() }

				{ this.props.showChevron && (
					<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
				) }
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events jsx-a11y/interactive-supports-focus */
	}
}

DomainSuggestion.Placeholder = function() {
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
