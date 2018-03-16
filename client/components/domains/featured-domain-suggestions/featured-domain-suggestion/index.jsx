/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	shouldBundleDomainWithPlan,
	getDomainPriceRule,
	hasDomainInCart,
} from 'lib/cart-values/cart-items';
import DomainSuggestion from 'components/domains/domain-suggestion';
import ProgressBar from 'components/progress-bar';

const NOTICE_GREEN = '#4ab866';

export class FeaturedDomainSuggestion extends Component {
	static propTypes = {
		cart: PropTypes.object,
		suggestion: PropTypes.object,
	};

	getButtonProps() {
		const {
			cart,
			domainsWithPlansOnly,
			isSignupStep,
			selectedSite,
			suggestion,
			translate,
		} = this.props;
		const domain = suggestion.domain_name;
		const isAdded = hasDomainInCart( cart, domain );

		let buttonClasses, buttonContent;

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			buttonContent =
				! isSignupStep &&
				shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
					? translate( 'Upgrade', {
							context: 'Domain mapping suggestion button with plan upgrade',
						} )
					: translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}
		return {
			buttonClasses,
			buttonContent,
		};
	}

	onButtonClick = () => {
		this.props.onButtonClick( this.props.suggestion );
	};

	renderDomain() {
		return (
			<h3 className="featured-domain-suggestion__title">{ this.props.suggestion.domain_name }</h3>
		);
	}

	renderProgressBar() {
		const { suggestion, translate } = this.props;
		const { isRecommended, isBestAlternative } = suggestion;

		let content, props;
		if ( isRecommended ) {
			content = translate( 'Best Match' );
			props = {
				color: NOTICE_GREEN,
				title: content,
				value: 90,
			};
		}

		if ( isBestAlternative ) {
			content = translate( 'Best Alternative' );
			props = {
				title: content,
				value: 80,
			};
		}

		if ( content ) {
			return (
				<div className="featured-domain-suggestion__progress-bar">
					<ProgressBar { ...props } />
					<span className="featured-domain-suggestion__progress-bar-text">{ content }</span>
				</div>
			);
		}
	}

	render() {
		const { suggestion, cart, domainsWithPlansOnly, selectedSite } = this.props;
		const suggestionClasses = classNames( 'featured-domain-suggestion', 'is-visible' );

		return (
			<DomainSuggestion
				domain={ suggestion.domain_name }
				domainsWithPlansOnly={ domainsWithPlansOnly }
				extraClasses={ suggestionClasses }
				onButtonClick={ this.onButtonClick }
				price={ suggestion.product_slug && suggestion.cost }
				priceRule={ getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion ) }
				showExpandedPrice
				{ ...this.getButtonProps() }
			>
				{ this.renderDomain() }
				{ this.renderProgressBar() }
			</DomainSuggestion>
		);
	}
}

export default localize( FeaturedDomainSuggestion );
