/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import classNames from 'classnames';
import { endsWith, get, includes, times, first } from 'lodash';

/**
 * Internal dependencies
 */
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainTransferSuggestion from 'components/domains/domain-transfer-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import FeaturedDomainSuggestions from 'components/domains/featured-domain-suggestions';
import { isNextDomainFree } from 'lib/cart-values/cart-items';
import Notice from 'components/notice';
import Card from 'components/card';
import ScreenReaderText from 'components/screen-reader-text';
import { getTld } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { DESIGN_TYPE_STORE } from 'signup/constants';

class DomainSearchResults extends React.Component {
	static propTypes = {
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		lastDomainIsTransferrable: PropTypes.bool,
		lastDomainStatus: PropTypes.string,
		lastDomainSearched: PropTypes.string,
		cart: PropTypes.object,
		products: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		availableDomain: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		suggestions: PropTypes.array,
		isLoadingSuggestions: PropTypes.bool.isRequired,
		placeholderQuantity: PropTypes.number.isRequired,
		buttonLabel: PropTypes.string,
		mappingSuggestionLabel: PropTypes.string,
		offerUnavailableOption: PropTypes.bool,
		onClickResult: PropTypes.func.isRequired,
		onAddMapping: PropTypes.func,
		onAddTransfer: PropTypes.func,
		onClickMapping: PropTypes.func,
		onClickTransfer: PropTypes.func,
		isSignupStep: PropTypes.bool,
		railcarSeed: PropTypes.string,
		fetchAlgo: PropTypes.string,
	};

	renderDomainAvailability() {
		const {
			availableDomain,
			lastDomainIsTransferrable,
			lastDomainStatus,
			lastDomainSearched,
			translate,
		} = this.props;
		const availabilityElementClasses = classNames( {
			'domain-search-results__domain-is-available': availableDomain,
			'domain-search-results__domain-not-available': ! availableDomain,
		} );
		const suggestions = this.props.suggestions || [];
		const { MAPPABLE, MAPPED, TLD_NOT_SUPPORTED, TRANSFERRABLE, UNKNOWN } = domainAvailability;

		const domain = get( availableDomain, 'domain_name', lastDomainSearched );

		let availabilityElement, domainSuggestionElement, offer;

		if (
			suggestions.length !== 0 &&
			includes(
				[ TRANSFERRABLE, MAPPABLE, MAPPED, TLD_NOT_SUPPORTED, UNKNOWN ],
				lastDomainStatus
			) &&
			this.props.products.domain_map
		) {
			const components = { a: <a href="#" onClick={ this.handleAddMapping } />, small: <small /> };

			if ( isNextDomainFree( this.props.cart ) ) {
				offer = translate(
					'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for free.{{/small}}',
					{ args: { domain }, components }
				);
			} else if ( ! this.props.domainsWithPlansOnly || this.props.isSiteOnPaidPlan ) {
				offer = translate(
					'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for %(cost)s.{{/small}}',
					{ args: { domain, cost: this.props.products.domain_map.cost_display }, components }
				);
			} else {
				offer = translate(
					'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} with WordPress.com Premium.{{/small}}',
					{ args: { domain }, components }
				);
			}

			// Domain Mapping not supported for Store NUX yet.
			if ( this.props.siteDesignType === DESIGN_TYPE_STORE ) {
				offer = null;
			}

			const domainUnavailableMessage = includes( [ TLD_NOT_SUPPORTED, UNKNOWN ], lastDomainStatus )
				? translate( '{{strong}}.%(tld)s{{/strong}} domains are not offered on WordPress.com.', {
						args: { tld: getTld( domain ) },
						components: { strong: <strong /> },
					} )
				: translate( '{{strong}}%(domain)s{{/strong}} is taken.', {
						args: { domain },
						components: { strong: <strong /> },
					} );

			if ( this.props.offerUnavailableOption ) {
				if ( this.props.siteDesignType !== DESIGN_TYPE_STORE && lastDomainIsTransferrable ) {
					availabilityElement = (
						<Card className="domain-search-results__transfer-card" highlight="info">
							<div className="domain-search-results__transfer-card-copy">
								<div>{ domainUnavailableMessage }</div>
								<p>
									{ translate(
										'If you already own this domain you can use it for your WordPress.com site.'
									) }
								</p>
							</div>
							<div className="domain-search-results__transfer-card-link">
								{ translate( '{{a}}Yes, I own this domain{{/a}}', {
									components: {
										a: (
											<a
												href="#"
												onClick={ this.props.onClickTransfer }
												data-tracks-button-click-source={ this.props.tracksButtonClickSource }
											/>
										),
									},
								} ) }
							</div>
						</Card>
					);
				} else if ( lastDomainStatus !== MAPPED ) {
					availabilityElement = (
						<Notice status="is-warning" showDismiss={ false }>
							{ domainUnavailableMessage } { offer }
						</Notice>
					);
				}
			}
		}

		return (
			<div className="domain-search-results__domain-availability">
				<div className={ availabilityElementClasses }>
					{ availabilityElement }
					{ domainSuggestionElement }
				</div>
			</div>
		);
	}

	handleAddMapping = () => {
		this.props.onAddMapping( this.props.lastDomainSearched );
	};

	renderPlaceholders() {
		return times( this.props.placeholderQuantity, function( n ) {
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
		} );
	}

	renderDomainSuggestions() {
		const { suggestions } = this.props;
		let suggestionCount;
		let featuredSuggestionElement;
		let suggestionElements;
		let unavailableOffer;

		if ( ! this.props.isLoadingSuggestions && this.props.suggestions ) {
			suggestionCount = (
				<div aria-live="polite">
					<ScreenReaderText>
						{ this.props.translate( '%s domains found', { args: this.props.suggestions.length } ) }
					</ScreenReaderText>
				</div>
			);

			let regularSuggestions = suggestions;

			if ( this.props.isSignupStep ) {
				regularSuggestions = suggestions.filter(
					suggestion => ! suggestion.isRecommended && ! suggestion.isBestAlternative
				);
				const bestMatchSuggestions = suggestions.filter( suggestion => suggestion.isRecommended );
				const bestAlternativeSuggestions = suggestions.filter(
					suggestion => suggestion.isBestAlternative
				);
				featuredSuggestionElement = (
					<FeaturedDomainSuggestions
						cart={ this.props.cart }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						isSignupStep={ this.props.isSignupStep }
						key="featured"
						onButtonClick={ this.props.onClickResult }
						primarySuggestion={ first( bestMatchSuggestions ) }
						query={ this.props.lastDomainSearched }
						secondarySuggestion={ first( bestAlternativeSuggestions ) }
						selectedSite={ this.props.selectedSite }
					/>
				);
			}

			suggestionElements = regularSuggestions.map( ( suggestion, i ) => {
				if ( suggestion.is_placeholder ) {
					return <DomainSuggestion.Placeholder key={ 'suggestion-' + i } />;
				}

				return (
					<DomainRegistrationSuggestion
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						isSignupStep={ this.props.isSignupStep }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						railcarId={ `${ this.props.railcarSeed }-registration-suggestion-${ i }` }
						uiPosition={ i }
						fetchAlgo={
							endsWith( suggestion.domain_name, '.wordpress.com' ) ? 'wpcom' : this.props.fetchAlgo
						}
						query={ this.props.lastDomainSearched }
						onButtonClick={ this.props.onClickResult }
					/>
				);
			} );

			if ( this.props.offerUnavailableOption && this.props.siteDesignType !== DESIGN_TYPE_STORE ) {
				unavailableOffer = (
					<DomainTransferSuggestion
						onButtonClick={ this.props.onClickTransfer }
						tracksButtonClickSource="search-suggestions-bottom"
					/>
				);
			}
		} else {
			featuredSuggestionElement = this.props.isSignupStep && (
				<FeaturedDomainSuggestions showPlaceholders />
			);
			suggestionElements = this.renderPlaceholders();
		}

		return (
			<div className="domain-search-results__domain-suggestions">
				{ suggestionCount }
				{ featuredSuggestionElement }
				{ this.props.children }
				{ suggestionElements }
				{ unavailableOffer }
			</div>
		);
	}

	render() {
		return (
			<div className="domain-search-results">
				{ this.renderDomainAvailability() }
				{ this.renderDomainSuggestions() }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isSiteOnPaidPlan: isSiteOnPaidPlan( state, selectedSiteId ),
		siteDesignType: getDesignType( state ),
	};
};

export default connect( mapStateToProps )( localize( DomainSearchResults ) );
