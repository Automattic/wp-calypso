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
import { endsWith, includes, times } from 'lodash';

/**
 * Internal dependencies
 */
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import DomainTransferSuggestion from 'components/domains/domain-transfer-suggestion';
import DomainMappingSuggestion from 'components/domains/domain-mapping-suggestion';
import DomainSuggestion from 'components/domains/domain-suggestion';
import { isNextDomainFree } from 'lib/cart-values/cart-items';
import Notice from 'components/notice';
import Card from 'components/card';
import { getTld } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { TRANSFER_IN } from 'state/current-user/constants';

class DomainSearchResults extends React.Component {
	static propTypes = {
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		lastDomainStatus: PropTypes.string,
		lastDomainSearched: PropTypes.string,
		cart: PropTypes.object,
		products: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		availableDomain: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		suggestions: PropTypes.array,
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
		const { availableDomain, lastDomainStatus, lastDomainSearched: domain, translate } = this.props;
		const availabilityElementClasses = classNames( {
			'domain-search-results__domain-is-available': availableDomain,
			'domain-search-results__domain-not-available': ! availableDomain,
		} );
		const suggestions = this.props.suggestions || [];
		const { MAPPABLE, UNKNOWN } = domainAvailability;

		let availabilityElement, domainSuggestionElement, offer;

		if ( availableDomain ) {
			// should use real notice component or custom class
			availabilityElement = (
				<Notice status="is-success" showDismiss={ false }>
					{ translate( '%(domain)s is available!', { args: { domain } } ) }
				</Notice>
			);

			domainSuggestionElement = (
				<DomainRegistrationSuggestion
					suggestion={ availableDomain }
					key={ availableDomain.domain_name }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					buttonContent={ this.props.buttonContent }
					selectedSite={ this.props.selectedSite }
					cart={ this.props.cart }
					isSignupStep={ this.props.isSignupStep }
					onButtonClick={ this.props.onClickResult }
				/>
			);
		} else if (
			suggestions.length !== 0 &&
			includes( [ MAPPABLE, UNKNOWN ], lastDomainStatus ) &&
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

			const domainUnavailableMessage =
				lastDomainStatus === UNKNOWN
					? translate( '{{strong}}.%(tld)s{{/strong}} domains are not offered on WordPress.com.', {
							args: { tld: getTld( domain ) },
							components: { strong: <strong /> },
						} )
					: translate( '{{strong}}%(domain)s{{/strong}} is taken.', {
							args: { domain },
							components: { strong: <strong /> },
						} );

			if ( this.props.offerUnavailableOption ) {
				if ( this.props.transferInAllowed && ! this.props.isSignupStep ) {
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
									components: { a: <a href="#" onClick={ this.props.onClickTransfer } /> },
								} ) }
							</div>
						</Card>
					);
				} else {
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

	handleAddTransfer = () => {
		this.props.onAddTransfer( this.props.lastDomainSearched );
	};

	renderPlaceholders() {
		return times( this.props.placeholderQuantity, function( n ) {
			return <DomainSuggestion.Placeholder key={ 'suggestion-' + n } />;
		} );
	}

	renderDomainSuggestions() {
		let suggestionElements;
		let unavailableOffer;

		if ( this.props.suggestions.length ) {
			suggestionElements = this.props.suggestions.map( function( suggestion, i ) {
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
			}, this );

			if ( this.props.offerUnavailableOption ) {
				unavailableOffer = (
					<DomainMappingSuggestion
						onButtonClick={ this.props.onClickMapping }
						products={ this.props.products }
						selectedSite={ this.props.selectedSite }
						domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
						isSignupStep={ this.props.isSignupStep }
						cart={ this.props.cart }
					/>
				);

				if ( this.props.transferInAllowed && ! this.props.isSignupStep ) {
					unavailableOffer = (
						<DomainTransferSuggestion onButtonClick={ this.props.onClickTransfer } />
					);
				}
			}
		} else {
			suggestionElements = this.renderPlaceholders();
		}

		return (
			<div className="domain-search-results__domain-suggestions">
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
		transferInAllowed: currentUserHasFlag( state, TRANSFER_IN ),
	};
};

export default connect( mapStateToProps )( localize( DomainSearchResults ) );
