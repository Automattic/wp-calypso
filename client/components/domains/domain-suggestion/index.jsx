/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import config from 'config';
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
		showExpandedPrice: PropTypes.bool,
	};

	static defaultProps = {
		buttonProps: config.isEnabled( 'domains/kracken-ui' )
			? { primary: true }
			: { borderless: true },
		showChevron: ! config.isEnabled( 'domains/kracken-ui' ),
		showExpandedPrice: false,
	};

	render() {
		const {
			children,
			extraClasses,
			hidePrice,
			isAdded,
			price,
			priceRule,
			showExpandedPrice,
		} = this.props;
		const classes = classNames(
			'domain-suggestion',
			'card',
			'is-compact',
			'is-clickable',
			{
				'is-added': isAdded,
				'is-kracken-ui': config.isEnabled( 'domains/kracken-ui' ),
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
					{ ! hidePrice && (
						<DomainProductPrice
							price={ price }
							rule={ priceRule }
							showExpandedPrice={ showExpandedPrice }
						/>
					) }
				</div>
				<Button className="domain-suggestion__action" { ...this.props.buttonProps }>
					{ this.props.buttonContent }
				</Button>
				{ this.props.showChevron && (
					<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
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
			<Gridicon className="domain-suggestion__chevron" icon="chevron-right" />
		</div>
	);
};

export default DomainSuggestion;
