/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { pickBy, includes } from 'lodash';

/**
 * Internal dependencies
 */
import FeaturedDomainSuggestion from 'components/domains/featured-domain-suggestions/featured-domain-suggestion';

export class FeaturedDomainSuggestions extends Component {
	static propTypes = {
		cart: PropTypes.object,
		primarySuggestion: PropTypes.object,
		secondarySuggestion: PropTypes.object,
	};

	getChildProps() {
		const childKeys = [
			'cart',
			'isSignupStep',
			'selectedSite',
			'domainsWithPlansOnly',
			'query',
			'onButtonClick',
		];
		return pickBy( this.props, ( value, key ) => includes( childKeys, key ) );
	}

	render() {
		const { primarySuggestion, secondarySuggestion } = this.props;
		const childProps = this.getChildProps();

		return (
			<div className="featured-domain-suggestions">
				<FeaturedDomainSuggestion suggestion={ primarySuggestion } { ...childProps } />
				<FeaturedDomainSuggestion suggestion={ secondarySuggestion } { ...childProps } />
			</div>
		);
	}
}

export default localize( FeaturedDomainSuggestions );
