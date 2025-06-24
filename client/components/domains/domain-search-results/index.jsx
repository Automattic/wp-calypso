import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { CompactCard, ScreenReaderText, MaterialIcon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, times } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DomainRegistrationSuggestion from 'calypso/components/domains/domain-registration-suggestion';
import DomainSkipSuggestion from 'calypso/components/domains/domain-skip-suggestion';
import DomainSuggestion from 'calypso/components/domains/domain-suggestion';
import FeaturedDomainSuggestions from 'calypso/components/domains/featured-domain-suggestions';
import Notice from 'calypso/components/notice';
import { isDomainMappingFree, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { isSubdomain } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getRootDomain } from 'calypso/lib/domains/utils';
import { DESIGN_TYPE_STORE } from 'calypso/signup/constants';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';

import './style.scss';

class DomainSearchResults extends Component {
	static propTypes = {
		isDomainOnly: PropTypes.bool,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		lastDomainIsTransferrable: PropTypes.bool,
		lastDomainStatus: PropTypes.string,
		lastDomainSearched: PropTypes.string,
		cart: PropTypes.object,
		isCartPendingUpdate: PropTypes.bool,
		isCartPendingUpdateDomain: PropTypes.object,
		premiumDomains: PropTypes.object,
		products: PropTypes.object,
		selectedSite: PropTypes.object,
		availableDomain: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		suggestions: PropTypes.array,
		isLoadingSuggestions: PropTypes.bool.isRequired,
		placeholderQuantity: PropTypes.number.isRequired,
		buttonLabel: PropTypes.string,
		mappingSuggestionLabel: PropTypes.string,
		offerUnavailableOption: PropTypes.bool,
		showAlreadyOwnADomain: PropTypes.bool,
		onClickResult: PropTypes.func.isRequired,
		onAddMapping: PropTypes.func,
		onAddTransfer: PropTypes.func,
		onClickMapping: PropTypes.func,
		onClickUseYourDomain: PropTypes.func,
		showSkipButton: PropTypes.bool,
		onSkip: PropTypes.func,
		isSignupStep: PropTypes.bool,
		showStrikedOutPrice: PropTypes.bool,
		railcarId: PropTypes.string,
		fetchAlgo: PropTypes.string,
		pendingCheckSuggestion: PropTypes.object,
		unavailableDomains: PropTypes.array,
		domainAndPlanUpsellFlow: PropTypes.bool,
		useProvidedProductsList: PropTypes.bool,
		wpcomSubdomainSelected: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	};

	renderDomainAvailability() {
		const {
			availableDomain,
			lastDomainIsTransferrable,
			lastDomainStatus,
			lastDomainSearched,
			lastDomainTld,
			selectedSite,
			translate,
			isDomainOnly,
		} = this.props;
		const availabilityElementClasses = clsx( {
			'domain-search-results__domain-is-available': availableDomain,
			'domain-search-results__domain-not-available': ! availableDomain,
		} );
		const suggestions = this.props.suggestions || [];
		const {
			MAPPABLE,
			MAPPED,
			RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE,
			SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
			TLD_NOT_SUPPORTED,
			TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE,
			TLD_NOT_SUPPORTED_TEMPORARILY,
			TRANSFERRABLE,
			UNKNOWN,
		} = domainAvailability;

		const domain = get( availableDomain, 'domain_name', lastDomainSearched );

		let availabilityElement;
		let offer;

		if (
			domain &&
			suggestions.length !== 0 &&
			[
				TRANSFERRABLE,
				MAPPABLE,
				MAPPED,
				RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE,
				SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE,
				TLD_NOT_SUPPORTED,
				TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE,
				TLD_NOT_SUPPORTED_TEMPORARILY,
				UNKNOWN,
			].includes( lastDomainStatus ) &&
			get( this.props, 'products.domain_map', false )
		) {
			// eslint-disable-next-line jsx-a11y/anchor-is-valid
			const components = { a: <a href="#" onClick={ this.handleAddMapping } /> };

			// If the domain is available we shouldn't offer to let people purchase mappings for it.
			if (
				[ TLD_NOT_SUPPORTED, TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE ].includes(
					lastDomainStatus
				)
			) {
				if ( isDomainMappingFree( selectedSite ) || isNextDomainFree( this.props.cart ) ) {
					offer = translate(
						'If you purchased %(domain)s elsewhere, you can {{a}}connect it{{/a}} for free.',
						{ args: { domain }, components }
					);
				} else {
					offer = translate(
						'If you purchased %(domain)s elsewhere, you can {{a}}connect it{{/a}} with WordPress.com %(premiumPlanName)s.',
						{
							args: { domain, premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '' },
							components,
						}
					);
				}
			}

			// Domain Mapping not supported for Store NUX yet.
			if ( this.props.siteDesignType === DESIGN_TYPE_STORE ) {
				offer = null;
			}

			let domainUnavailableMessage;

			const domainArgument = ! isSubdomain( domain ) ? domain : getRootDomain( domain );

			domainUnavailableMessage = [ TLD_NOT_SUPPORTED, UNKNOWN ].includes( lastDomainStatus )
				? translate(
						'{{strong}}.%(tld)s{{/strong}} domains are not available for registration on WordPress.com.',
						{
							args: { tld: lastDomainTld },
							components: {
								strong: <strong />,
							},
						}
				  )
				: translate(
						'{{strong}}%(domain)s{{/strong}} is already registered. {{a}}Do you own it?{{/a}}',
						{
							args: { domain: domainArgument },
							components: {
								strong: <strong />,
								a: (
									// eslint-disable-next-line jsx-a11y/anchor-is-valid
									<a
										href="#"
										onClick={ ( event ) =>
											this.props.onClickUseYourDomain( event, domainArgument )
										}
										data-tracks-button-click-source={ this.props.tracksButtonClickSource }
									/>
								),
							},
						}
				  );

			if (
				isSubdomain( domain ) &&
				! [ TLD_NOT_SUPPORTED, UNKNOWN ].includes( lastDomainStatus )
			) {
				const rootDomain = getRootDomain( domain );
				domainUnavailableMessage = translate(
					'{{strong}}%(rootDomain)s{{/strong}} is already registered. Do you own {{strong}}%(rootDomain)s{{/strong}} and want to {{a}}{{strong}}connect %(domain)s{{/strong}}{{/a}} with WordPress.com?',
					{
						args: { rootDomain, domain },
						components: {
							strong: <strong />,
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-is-valid
								<a
									href="#"
									onClick={ this.props.onClickUseYourDomain }
									data-tracks-button-click-source={ this.props.tracksButtonClickSource }
								/>
							),
						},
					}
				);
			}

			if ( isDomainOnly && ! [ TLD_NOT_SUPPORTED, UNKNOWN ].includes( lastDomainStatus ) ) {
				domainUnavailableMessage = translate(
					'{{strong}}%(domain)s{{/strong}} is already registered. Do you own this domain? {{a}}Transfer it to WordPress.com{{/a}} now, or try another search.',
					{
						args: { domain: domainArgument },
						components: {
							strong: <strong />,
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-is-valid
								<a href={ `/setup/domain-transfer?new=${ domain ?? '' }` } />
							),
						},
					}
				);
			}

			if ( TLD_NOT_SUPPORTED_TEMPORARILY === lastDomainStatus ) {
				domainUnavailableMessage = translate(
					'{{strong}}.%(tld)s{{/strong}} domains are temporarily not offered on WordPress.com. ' +
						'Please try again later or choose a different extension.',
					{
						args: { tld: lastDomainTld },
						components: { strong: <strong /> },
					}
				);
			}

			if ( this.props.offerUnavailableOption || this.props.showAlreadyOwnADomain ) {
				if ( this.props.siteDesignType !== DESIGN_TYPE_STORE && lastDomainIsTransferrable ) {
					availabilityElement = (
						<CompactCard className="domain-search-results__domain-available-notice">
							<span className="domain-search-results__domain-available-notice-icon">
								<MaterialIcon icon="info" />
							</span>
							<span>{ domainUnavailableMessage }</span>
						</CompactCard>
					);
				} else if ( lastDomainStatus !== MAPPED ) {
					availabilityElement = (
						<CompactCard className="domain-search-results__domain-available-notice">
							<span className="domain-search-results__domain-available-notice-icon">
								<MaterialIcon icon="info" />
							</span>
							<span>
								{ domainUnavailableMessage } { offer }
							</span>
						</CompactCard>
					);
				}
			} else {
				availabilityElement = (
					<Notice status="is-warning" showDismiss={ false }>
						{ domainUnavailableMessage }
					</Notice>
				);
			}
		}

		return (
			<div className="domain-search-results__domain-availability">
				<div className={ availabilityElementClasses }>{ availabilityElement }</div>
			</div>
		);
	}

	handleAddMapping = ( event ) => {
		event.preventDefault();
		if ( this.props.isSignupStep ) {
			this.props.onClickUseYourDomain( event );
		} else {
			this.props.onAddMapping( this.props.lastDomainSearched );
		}
	};

	renderPlaceholders() {
		return times( this.props.placeholderQuantity, function ( n ) {
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
		} );
	}

	renderDomainSuggestions() {
		const { isDomainOnly, suggestions, showStrikedOutPrice } = this.props;
		let suggestionCount;
		let featuredSuggestionElement;
		let suggestionElements;
		let unavailableOffer;
		let domainSkipSuggestion;

		if ( ! this.props.isLoadingSuggestions && this.props.suggestions ) {
			suggestionCount = (
				<div aria-live="polite">
					<ScreenReaderText>
						{ this.props.translate( '%s domains found', { args: this.props.suggestions.length } ) }
					</ScreenReaderText>
				</div>
			);

			const regularSuggestions = suggestions.filter(
				( suggestion ) => ! suggestion.isRecommended && ! suggestion.isBestAlternative
			);
			const featuredSuggestions = suggestions.filter(
				( suggestion ) => suggestion.isRecommended || suggestion.isBestAlternative
			);

			featuredSuggestionElement = (
				<FeaturedDomainSuggestions
					cart={ this.props.cart }
					isCartPendingUpdate={ this.props.isCartPendingUpdate }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					isDomainOnly={ isDomainOnly }
					fetchAlgo={ this.props.fetchAlgo }
					isSignupStep={ this.props.isSignupStep }
					showStrikedOutPrice={ showStrikedOutPrice }
					key="featured"
					onButtonClick={ this.props.onClickResult }
					premiumDomains={ this.props.premiumDomains }
					featuredSuggestions={ featuredSuggestions }
					query={ this.props.lastDomainSearched }
					railcarId={ this.props.railcarId }
					selectedSite={ this.props.selectedSite }
					pendingCheckSuggestion={ this.props.pendingCheckSuggestion }
					unavailableDomains={ this.props.unavailableDomains }
					hideMatchReasons={ this.props.hideMatchReasons }
					domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
					products={ this.props.useProvidedProductsList ? this.props.products : undefined }
					isCartPendingUpdateDomain={ this.props.isCartPendingUpdateDomain }
					temporaryCart={ this.props.temporaryCart }
					domainRemovalQueue={ this.props.domainRemovalQueue }
				/>
			);

			suggestionElements = regularSuggestions.map( ( suggestion, i ) => {
				if ( suggestion.is_placeholder ) {
					return <DomainSuggestion.Placeholder key={ 'suggestion-' + i } />;
				}

				return (
					<DomainRegistrationSuggestion
						isCartPendingUpdate={ this.props.isCartPendingUpdate }
						isDomainOnly={ isDomainOnly }
						suggestion={ suggestion }
						suggestionSelected={
							this.props.wpcomSubdomainSelected?.domain_name === suggestion?.domain_name
						}
						key={ suggestion.domain_name }
						cart={ this.props.cart }
						isSignupStep={ this.props.isSignupStep }
						showStrikedOutPrice={ this.props.showStrikedOutPrice }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						railcarId={ this.props.railcarId + '-' + ( i + 2 ) }
						uiPosition={ i + 2 }
						fetchAlgo={ suggestion.fetch_algo ? suggestion.fetch_algo : this.props.fetchAlgo }
						query={ this.props.lastDomainSearched }
						onButtonClick={ this.props.onClickResult }
						premiumDomain={ this.props.premiumDomains[ suggestion.domain_name ] }
						pendingCheckSuggestion={ this.props.pendingCheckSuggestion }
						unavailableDomains={ this.props.unavailableDomains }
						hideMatchReasons={ this.props.hideMatchReasons }
						domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
						products={ this.props.useProvidedProductsList ? this.props.products : undefined }
						isCartPendingUpdateDomain={ this.props.isCartPendingUpdateDomain }
						temporaryCart={ this.props.temporaryCart }
						domainRemovalQueue={ this.props.domainRemovalQueue }
					/>
				);
			} );

			domainSkipSuggestion = (
				<DomainSkipSuggestion
					selectedSiteSlug={ this.props.selectedSite?.slug }
					onButtonClick={ () => this.props.onSkip() }
				/>
			);
		} else {
			featuredSuggestionElement = <FeaturedDomainSuggestions showPlaceholders />;
			suggestionElements = this.renderPlaceholders();
		}

		return (
			<div className="domain-search-results__domain-suggestions">
				{ suggestionCount }
				{ featuredSuggestionElement }
				{ suggestionElements }
				{ unavailableOffer }
				{ this.props.showSkipButton && domainSkipSuggestion }
				{ this.props.children }
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
	};
};

export default connect( mapStateToProps )( localize( DomainSearchResults ) );
