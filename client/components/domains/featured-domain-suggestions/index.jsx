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
import FeaturedDomainSuggestionsPlaceholder from './placeholder';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';

/**
 * Style dependencies
 */
import './style.scss';

export class FeaturedDomainSuggestions extends Component {
	static propTypes = {
		cart: PropTypes.object,
		fetchAlgo: PropTypes.string,
		isSignupStep: PropTypes.bool,
		primarySuggestion: PropTypes.object,
		railcarId: PropTypes.string,
		secondarySuggestion: PropTypes.object,
		showPlaceholders: PropTypes.bool,
		pendingCheckSuggestion: PropTypes.object,
		unavailableDomains: PropTypes.array,
	};

	getChildProps() {
		const childKeys = [
			'cart',
			'isDomainOnly',
			'domainsWithPlansOnly',
			'isSignupStep',
			'onButtonClick',
			'query',
			'selectedSite',
			'pendingCheckSuggestion',
			'unavailableDomains',
		];
		return pick( this.props, childKeys );
	}

	getMaxTitleLength() {
		const { primarySuggestion = {}, secondarySuggestion = {} } = this.props;
		const { domain_name: primaryDomainName = '' } = primarySuggestion;
		const { domain_name: secondaryDomainName = '' } = secondarySuggestion;
		const longestDomainName =
			primaryDomainName.length >= secondaryDomainName.length
				? primaryDomainName
				: secondaryDomainName;
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

		return 'featured-domain-suggestions--title-causes-overflow';
	}

	getClassNames() {
		return classNames( 'featured-domain-suggestions', this.getTextSizeClass(), {
			'featured-domain-suggestions__is-domain-management': ! this.props.isSignupStep,
			'featured-domain-suggestions--has-match-reasons': this.hasMatchReasons(),
		} );
	}

	getFetchAlgorithm( suggestion ) {
		return suggestion.fetch_algo ? suggestion.fetch_algo : this.props.fetchAlgo;
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

		if ( this.props.showPlaceholders ) {
			return this.renderPlaceholders();
		}

		return (
			<div className={ this.getClassNames() }>
				{ primarySuggestion && (
					<DomainRegistrationSuggestion
						suggestion={ primarySuggestion }
						isFeatured
						railcarId={ this.props.railcarId + '-0' }
						isSignupStep={ this.props.isSignupStep }
						uiPosition={ 0 }
						fetchAlgo={ this.getFetchAlgorithm( primarySuggestion ) }
						buttonStyles={ { primary: true } }
						{ ...childProps }
						isEligibleVariantForDomainTest={ this.props.isEligibleVariantForDomainTest }
					/>
				) }
				{ secondarySuggestion && (
					<DomainRegistrationSuggestion
						suggestion={ secondarySuggestion }
						isFeatured
						railcarId={ this.props.railcarId + '-1' }
						isSignupStep={ this.props.isSignupStep }
						uiPosition={ 1 }
						fetchAlgo={ this.getFetchAlgorithm( secondarySuggestion ) }
						{ ...childProps }
						isEligibleVariantForDomainTest={ this.props.isEligibleVariantForDomainTest }
					/>
				) }
			</div>
		);
	}

	renderPlaceholders() {
		return (
			<div className={ this.getClassNames() }>
				<FeaturedDomainSuggestionsPlaceholder />
				<FeaturedDomainSuggestionsPlaceholder />
			</div>
		);
	}
}

export default localize( FeaturedDomainSuggestions );
