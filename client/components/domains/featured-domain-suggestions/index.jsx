import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AIassistantIllustration from 'calypso/assets/images/domains/ai-assitant.svg';
import DomainRegistrationSuggestion from 'calypso/components/domains/domain-registration-suggestion';
import FeaturedDomainSuggestionsPlaceholder from './placeholder';

import './style.scss';

export class FeaturedDomainSuggestions extends Component {
	static propTypes = {
		cart: PropTypes.object,
		isCartPendingUpdate: PropTypes.bool,
		fetchAlgo: PropTypes.string,
		showStrikedOutPrice: PropTypes.bool,
		railcarId: PropTypes.string,
		featuredSuggestions: PropTypes.array,
		showPlaceholders: PropTypes.bool,
		pendingCheckSuggestion: PropTypes.object,
		unavailableDomains: PropTypes.array,
		domainAndPlanUpsellFlow: PropTypes.bool,
		products: PropTypes.object,
		isCartPendingUpdateDomain: PropTypes.object,
		temporaryCart: PropTypes.array,
		domainRemovalQueue: PropTypes.array,
	};

	getChildProps() {
		const childKeys = [
			'cart',
			'isCartPendingUpdate',
			'isDomainOnly',
			'domainsWithPlansOnly',
			'showStrikedOutPrice',
			'onButtonClick',
			'query',
			'selectedSite',
			'pendingCheckSuggestion',
			'unavailableDomains',
			'domainAndPlanUpsellFlow',
			'temporaryCart',
			'domainRemovalQueue',
		];
		return pick( this.props, childKeys );
	}

	getMaxTitleLength() {
		const { featuredSuggestions } = this.props;

		const allDomainNameLengths = featuredSuggestions?.map(
			( suggestion ) => suggestion.domain_name.length
		);

		if ( ! featuredSuggestions ) {
			return 0;
		}

		return Math.max( ...allDomainNameLengths );
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
		return clsx( 'featured-domain-suggestions', this.getTextSizeClass(), {
			'featured-domain-suggestions__is-domain-management': ! this.props.showStrikedOutPrice,
			'featured-domain-suggestions--has-match-reasons': this.hasMatchReasons(),
		} );
	}

	getFetchAlgorithm( suggestion ) {
		return suggestion.fetch_algo ? suggestion.fetch_algo : this.props.fetchAlgo;
	}

	hasMatchReasons() {
		return this.props.featuredSuggestions?.some( ( suggestion ) =>
			Array.isArray( suggestion.match_reason )
		);
	}

	render() {
		const { featuredSuggestions, handleMoreResultsClick } = this.props;
		const childProps = this.getChildProps();

		if ( this.props.showPlaceholders ) {
			return this.renderPlaceholders();
		}

		return (
			<div className={ this.getClassNames() }>
				{ featuredSuggestions.map( ( suggestion, index ) => (
					<div className="featured-domain-suggestions__wrapper" key={ suggestion.domain_name }>
						{ this.props.shouldShowAISuggestedSiteName && (
							<>
								<div className="featured-domain-suggestions__site-name-suggestion">
									<img src={ AIassistantIllustration } width={ 24 } alt="" />
									<div className="featured-domain-suggestions__site-name-wrapper">
										<h2 className="featured-domain-suggestions__site-name-suggestion-text">
											{ suggestion.business_name }
										</h2>
										<div
											className="featured-domain-suggestions__more-search-results"
											onClick={ handleMoreResultsClick }
										>
											{ this.props.translate( '(more like this)' ) }
										</div>
									</div>
								</div>
							</>
						) }
						<DomainRegistrationSuggestion
							suggestion={ suggestion }
							isFeatured
							railcarId={ this.props.railcarId + '-' + index }
							isSignupStep={ this.props.isSignupStep }
							uiPosition={ index }
							premiumDomain={ this.props.premiumDomains[ suggestion.domain_name ] }
							fetchAlgo={ this.getFetchAlgorithm( suggestion ) }
							buttonStyles={ { primary: true } }
							isReskinned={ this.props.isReskinned }
							products={ this.props.products ?? undefined }
							isCartPendingUpdateDomain={ this.props.isCartPendingUpdateDomain }
							{ ...childProps }
						/>
					</div>
				) ) }
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
