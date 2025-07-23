import { DomainSuggestion } from '@automattic/domain-search';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import DomainRegistrationSuggestion from '../domain-registration-suggestion';

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

	getFetchAlgorithm( suggestion ) {
		return suggestion.fetch_algo ? suggestion.fetch_algo : this.props.fetchAlgo;
	}

	hasMatchReasons() {
		return this.props.featuredSuggestions?.some( ( suggestion ) =>
			Array.isArray( suggestion.match_reason )
		);
	}

	render() {
		const { featuredSuggestions } = this.props;
		const childProps = this.getChildProps();

		if ( this.props.showPlaceholders ) {
			return this.renderPlaceholders();
		}

		return (
			<div className="featured-domain-suggestions-v2">
				<div className="featured-domain-suggestions-v2__content">
					{ featuredSuggestions.map( ( suggestion, index ) => (
						<div className="featured-domain-suggestions-v2__item" key={ suggestion.domain_name }>
							<DomainRegistrationSuggestion
								suggestion={ suggestion }
								isFeatured
								railcarId={ this.props.railcarId + '-' + index }
								isSignupStep={ this.props.isSignupStep }
								uiPosition={ index }
								premiumDomain={ this.props.premiumDomains[ suggestion.domain_name ] }
								fetchAlgo={ this.getFetchAlgorithm( suggestion ) }
								buttonStyles={ { primary: true } }
								hideMatchReasons={ this.props.hideMatchReasons }
								products={ this.props.products ?? undefined }
								isCartPendingUpdateDomain={ this.props.isCartPendingUpdateDomain }
								{ ...childProps }
							/>
						</div>
					) ) }
				</div>
			</div>
		);
	}

	renderPlaceholders() {
		return (
			<div className="featured-domain-suggestions-v2">
				<div className="featured-domain-suggestions-v2__content">
					<DomainSuggestion.Featured.Placeholder />
					<DomainSuggestion.Featured.Placeholder />
				</div>
			</div>
		);
	}
}

export default localize( FeaturedDomainSuggestions );
