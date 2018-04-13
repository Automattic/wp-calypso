/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
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

	getMaxTitleLength() {
		const { primarySuggestion = {}, secondarySuggestion = {} } = this.props;
		const { domain_name: primaryDomainName = '' } = primarySuggestion;
		const { domain_name: secondaryDomainName = '' } = secondarySuggestion;
		const longestDomainName =
			primaryDomainName.length >= secondaryDomainName ? primaryDomainName : secondaryDomainName;
		return longestDomainName.length;
	}

	getTextSizeClass() {
		const length = this.getMaxTitleLength();
		const classNamePrefix = 'featured-domain-suggestions--title-in';
		if ( length <= 18 ) {
			return `${ classNamePrefix }-20em`;
		}
		if ( length <= 19 ) {
			return `${ classNamePrefix }-18em`;
		}
		if ( length <= 22 ) {
			return `${ classNamePrefix }-16em`;
		}
		if ( length <= 25 ) {
			return `${ classNamePrefix }-14em`;
		}
		if ( length <= 27 ) {
			return `${ classNamePrefix }-12em`;
		}
		if ( length <= 33 ) {
			return `${ classNamePrefix }-10em`;
		}

		return 'featured-domain-suggestions--title-cases-overflow';
	}

	getClassNames() {
		return classNames( 'featured-domain-suggestions', this.getTextSizeClass(), {
			'featured-domain-suggestions--has-match-reasons': this.hasMatchReasons(),
		} );
	}

	hasMatchReasons() {
		const { primarySuggestion = {}, secondarySuggestion = {} } = this.props;
		return (
			Array.isArray( primarySuggestion.match_reasons ) ||
			Array.isArray( secondarySuggestion.match_reasons )
		);
	}

	render() {
		const { primarySuggestion, secondarySuggestion } = this.props;
		const childProps = this.getChildProps();

		return (
			<div className={ this.getClassNames() }>
				{ primarySuggestion && (
					<DomainRegistrationSuggestion
						suggestion={ primarySuggestion }
						isFeatured
						{ ...childProps }
					/>
				) }
				{ secondarySuggestion && (
					<DomainRegistrationSuggestion
						suggestion={ secondarySuggestion }
						isFeatured
						{ ...childProps }
					/>
				) }
			</div>
		);
	}
}

export default localize( FeaturedDomainSuggestions );
