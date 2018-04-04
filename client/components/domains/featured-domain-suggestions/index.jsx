/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';

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
		return pick( this.props, childKeys );
	}

	render() {
		const { primarySuggestion, secondarySuggestion } = this.props;
		const childProps = this.getChildProps();

		return (
			<div className="featured-domain-suggestions">
				<DomainRegistrationSuggestion
					suggestion={ primarySuggestion }
					isFeatured
					{ ...childProps }
				/>
				<DomainRegistrationSuggestion
					suggestion={ secondarySuggestion }
					isFeatured
					{ ...childProps }
				/>
			</div>
		);
	}
}

export default localize( FeaturedDomainSuggestions );
