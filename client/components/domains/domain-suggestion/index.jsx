/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import GridiconChevronRight from 'gridicons/dist/chevron-right';

/**
 * Internal dependencies
 */
import DomainProductPrice from 'components/domains/domain-product-price';
import Button from 'components/button';

class DomainSuggestion extends React.Component {
	static propTypes = {
		buttonContent: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ).isRequired,
		buttonProps: PropTypes.object,
		extraClasses: PropTypes.string,
		onButtonClick: PropTypes.func.isRequired,
		priceRule: PropTypes.string,
		price: PropTypes.string,
		domain: PropTypes.string,
		hidePrice: PropTypes.bool,
		showChevron: PropTypes.bool,
	};

	static defaultProps = {
		buttonProps: { primary: true },
		showChevron: false,
	};

	render() {
		const { children, extraClasses, hidePrice, isAdded, price, priceRule } = this.props;
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
					{ ! hidePrice && <DomainProductPrice price={ price } rule={ priceRule } /> }
				</div>
				<Button className="domain-suggestion__action" { ...this.props.buttonProps }>
					{ this.props.buttonContent }
				</Button>
				{ this.props.showChevron && (
					<GridiconChevronRight className="domain-suggestion__chevron" />
				) }
			</div>
		);
	}
}

DomainSuggestion.Placeholder = function() {
	return (
		<div className="domain-suggestion card is-compact is-placeholder is-clickable">
			<div className="domain-suggestion__content">
				<h3 />
			</div>
			<div className="domain-suggestion__action" />
			<GridiconChevronRight className="domain-suggestion__chevron" />
		</div>
	);
};

export default DomainSuggestion;
