/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get, includes, times, first } from 'lodash';

/**
 * Internal dependencies
 */
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainTransferSuggestion from 'components/domains/domain-transfer-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import FeaturedDomainSuggestions from 'components/domains/featured-domain-suggestions';
import { isDomainMappingFree, isNextDomainFree } from 'lib/cart-values/cart-items';
import Notice from 'components/notice';
import { Card, ScreenReaderText } from '@automattic/components';
import { getTld } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { DESIGN_TYPE_STORE } from 'signup/constants';
import { hideSitePreview } from 'state/signup/preview/actions';
import { isSitePreviewVisible } from 'state/signup/preview/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class DomainSearchResults extends React.Component {
	static propTypes = {
		isDomainOnly: PropTypes.bool,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		lastDomainIsTransferrable: PropTypes.bool,
		lastDomainStatus: PropTypes.string,
		lastDomainSearched: PropTypes.string,
		cart: PropTypes.object,
		products: PropTypes.object,
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
		onClickUseYourDomain: PropTypes.func,
		isSignupStep: PropTypes.bool,
		railcarId: PropTypes.string,
		fetchAlgo: PropTypes.string,
		pendingCheckSuggestion: PropTypes.object,
		unavailableDomains: PropTypes.array,
	};

	componentDidUpdate() {
		// If the signup site preview is showing, turn it off when domain search results are visible
		if ( this.props.isSignupStep && this.props.isSitePreviewVisible ) {
			this.props.hideSitePreview();
		}
	}

	renderDomainAvailability() {
		const {
			availableDomain,
			domainsWithPlansOnly,
			lastDomainIsTransferrable,
			lastDomainStatus,
			lastDomainSearched,
			selectedSite,
			translate,
		} = this.props;
		const availabilityElementClasses = classNames( {
			'domain-search-results__domain-is-available': availableDomain,
			'domain-search-results__domain-not-available': ! availableDomain,
		} );
		const suggestions = this.props.suggestions || [];
		const {
			MAPPABLE,
			MAPPED,
			TLD_NOT_SUPPORTED,
			TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE,
			TLD_NOT_SUPPORTED_TEMPORARILY,
			TRANSFERRABLE,
			UNKNOWN,
		} = domainAvailability;

		const domain = get( availableDomain, 'domain_name', lastDomainSearched );

		let availabilityElement, offer;

		if (
			domain &&
			suggestions.length !== 0 &&
			includes(
				[
					TRANSFERRABLE,
					MAPPABLE,
					MAPPED,
					TLD_NOT_SUPPORTED,
					TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE,
					TLD_NOT_SUPPORTED_TEMPORARILY,
					UNKNOWN,
				],
				lastDomainStatus
			) &&
			get( this.props, 'products.domain_map', false )
		) {
			// eslint-disable-next-line jsx-a11y/anchor-is-valid
			const components = { a: <a href="#" onClick={ this.handleAddMapping } />, small: <small /> };

			// If the domain is available we shouldn't offer to let people purchase mappings for it.
			if ( TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE === lastDomainStatus ) {
				if ( isDomainMappingFree( selectedSite ) || isNextDomainFree( this.props.cart ) ) {
					offer = translate(
						'{{small}}If you purchased %(domain)s elsewhere, you can {{a}}map it{{/a}} for free.{{/small}}',
						{ args: { domain }, components }
					);
				} else if ( ! domainsWithPlansOnly ) {
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
			}

			// Domain Mapping not supported for Store NUX yet.
			if ( this.props.siteDesignType === DESIGN_TYPE_STORE ) {
				offer = null;
			}

			let domainUnavailableMessage = includes( [ TLD_NOT_SUPPORTED, UNKNOWN ], lastDomainStatus )
				? translate( '{{strong}}.%(tld)s{{/strong}} domains are not offered on WordPress.com.', {
						args: { tld: getTld( domain ) },
						components: { strong: <strong /> },
				  } )
				: translate( '{{strong}}%(domain)s{{/strong}} is taken.', {
						args: { domain },
						components: { strong: <strong /> },
				  } );

			if ( TLD_NOT_SUPPORTED_TEMPORARILY === lastDomainStatus ) {
				domainUnavailableMessage = translate(
					'{{strong}}.%(tld)s{{/strong}} domains are temporarily not offered on WordPress.com. ' +
						'Please try again later or choose a different extension.',
					{
						args: { tld: getTld( domain ) },
						components: { strong: <strong /> },
					}
				);
			}

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
											// eslint-disable-next-line jsx-a11y/anchor-is-valid
											<a
												href="#"
												onClick={ this.props.onClickUseYourDomain }
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
				<div className={ availabilityElementClasses }>{ availabilityElement }</div>
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
		const { isDomainOnly, suggestions } = this.props;
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

			const regularSuggestions = suggestions.filter(
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
					isDomainOnly={ isDomainOnly }
					fetchAlgo={ this.props.fetchAlgo }
					isSignupStep={ this.props.isSignupStep }
					key="featured"
					onButtonClick={ this.props.onClickResult }
					primarySuggestion={ first( bestMatchSuggestions ) }
					query={ this.props.lastDomainSearched }
					railcarId={ this.props.railcarId }
					secondarySuggestion={ first( bestAlternativeSuggestions ) }
					selectedSite={ this.props.selectedSite }
					pendingCheckSuggestion={ this.props.pendingCheckSuggestion }
					unavailableDomains={ this.props.unavailableDomains }
					isEligibleVariantForDomainTest={ this.props.isEligibleVariantForDomainTest }
				/>
			);

			suggestionElements = regularSuggestions.map( ( suggestion, i ) => {
				if ( suggestion.is_placeholder ) {
					return <DomainSuggestion.Placeholder key={ 'suggestion-' + i } />;
				}

				return (
					<DomainRegistrationSuggestion
						isDomainOnly={ isDomainOnly }
						suggestion={ suggestion }
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						isSignupStep={ this.props.isSignupStep }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						railcarId={ this.props.railcarId + '-' + ( i + 2 ) }
						uiPosition={ i + 2 }
						fetchAlgo={ suggestion.fetch_algo ? suggestion.fetch_algo : this.props.fetchAlgo }
						query={ this.props.lastDomainSearched }
						onButtonClick={ this.props.onClickResult }
						pendingCheckSuggestion={ this.props.pendingCheckSuggestion }
						unavailableDomains={ this.props.unavailableDomains }
						isEligibleVariantForDomainTest={ this.props.isEligibleVariantForDomainTest }
					/>
				);
			} );

			if ( this.props.offerUnavailableOption && this.props.siteDesignType !== DESIGN_TYPE_STORE ) {
				unavailableOffer = (
					<DomainTransferSuggestion
						onButtonClick={ this.props.onClickUseYourDomain }
						tracksButtonClickSource="search-suggestions-bottom"
					/>
				);
			}
		} else {
			featuredSuggestionElement = <FeaturedDomainSuggestions showPlaceholders />;
			suggestionElements = this.renderPlaceholders();
		}

		return (
			<div className="domain-search-results__domain-suggestions">
				{ this.props.children }
				{ suggestionCount }
				{ featuredSuggestionElement }
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

const mapStateToProps = ( state, ownProps ) => {
	return {
		// Set site design type only if we're in signup
		siteDesignType: ownProps.isSignupStep && getDesignType( state ),
		isSitePreviewVisible: ownProps.isSignupStep && isSitePreviewVisible( state ),
	};
};

export default connect( mapStateToProps, { hideSitePreview } )( localize( DomainSearchResults ) );
