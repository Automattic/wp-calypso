/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isNumber } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import DomainSuggestion from 'components/domains/domain-suggestion';
import DomainSuggestionFlag from 'components/domains/domain-suggestion-flag';
import {
	shouldBundleDomainWithPlan,
	getDomainPriceRule,
	hasDomainInCart,
} from 'lib/cart-values/cart-items';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	isNewTld,
	isTestTld,
	parseMatchReasons,
	VALID_MATCH_REASONS,
} from 'components/domains/domain-registration-suggestion/utility';
import ProgressBar from 'components/progress-bar';

const NOTICE_GREEN = '#4ab866';

class DomainRegistrationSuggestion extends React.Component {
	static propTypes = {
		isSignupStep: PropTypes.bool,
		isFeatured: PropTypes.bool,
		cart: PropTypes.object,
		suggestion: PropTypes.shape( {
			domain_name: PropTypes.string.isRequired,
			product_slug: PropTypes.string,
			cost: PropTypes.string,
			match_reasons: PropTypes.arrayOf( PropTypes.oneOf( VALID_MATCH_REASONS ) ),
		} ).isRequired,
		onButtonClick: PropTypes.func.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object,
		railcarId: PropTypes.string,
		recordTracksEvent: PropTypes.func,
		uiPosition: PropTypes.number,
		fetchAlgo: PropTypes.string,
		query: PropTypes.string,
	};

	componentDidMount() {
		if ( this.props.railcarId && isNumber( this.props.uiPosition ) ) {
			let resultSuffix = '';
			if ( this.props.suggestion.isRecommended ) {
				resultSuffix = '#recommended';
			} else if ( this.props.suggestion.isBestAlternative ) {
				resultSuffix = '#best-alternative';
			}

			this.props.recordTracksEvent( 'calypso_traintracks_render', {
				railcar: this.props.railcarId,
				ui_position: this.props.uiPosition,
				fetch_algo: this.props.fetchAlgo,
				rec_result: `${ this.props.suggestion.domain_name }${ resultSuffix }`,
				fetch_query: this.props.query,
			} );
		}
	}

	onButtonClick = () => {
		if ( this.props.railcarId ) {
			this.props.recordTracksEvent( 'calypso_traintracks_interact', {
				railcar: this.props.railcarId,
				action: 'domain_added_to_cart',
			} );
		}

		this.props.onButtonClick( this.props.suggestion );
	};

	getDomainFlags() {
		const { suggestion, translate } = this.props;
		const domain = suggestion.domain_name;
		const domainFlags = [];

		if ( domain ) {
			// Grab everything from the first dot, so 'example.co.uk' will
			// match '.co.uk' but not '.uk'
			// This won't work if we add subdomains.
			const tld = domain.substring( domain.indexOf( '.' ) );

			if ( isNewTld( tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-new` }
						content={ translate( 'New' ) }
						status="success"
					/>
				);
			}

			if ( isTestTld( tld ) ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-testing` }
						content={ 'Testing only' }
						status="warning"
					/>
				);
			}
		}

		if ( ! config.isEnabled( 'domains/kracken-ui' ) ) {
			if ( suggestion.isRecommended ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-recommended` }
						content={ translate( 'Recommended' ) }
						status="success"
					/>
				);
			}

			if ( suggestion.isBestAlternative ) {
				domainFlags.push(
					<DomainSuggestionFlag
						key={ `${ domain }-best-alternative` }
						content={ translate( 'Best Alternative' ) }
					/>
				);
			}
		}

		return domainFlags;
	}

	getButtonProps() {
		const {
			cart,
			domainsWithPlansOnly,
			isSignupStep,
			selectedSite,
			suggestion,
			translate,
		} = this.props;
		const { domain_name: domain } = suggestion;
		const isAdded = hasDomainInCart( cart, domain );

		let buttonClasses, buttonContent;

		if ( isAdded ) {
			buttonClasses = 'added';
			buttonContent = <Gridicon icon="checkmark" />;
		} else {
			buttonClasses = 'add is-primary';
			buttonContent =
				! isSignupStep &&
				shouldBundleDomainWithPlan( domainsWithPlansOnly, selectedSite, cart, suggestion )
					? translate( 'Upgrade', {
							context: 'Domain mapping suggestion button with plan upgrade',
						} )
					: translate( 'Select', { context: 'Domain mapping suggestion button' } );
		}
		return {
			buttonClasses,
			buttonContent,
		};
	}

	getPriceRule() {
		const { cart, domainsWithPlansOnly, selectedSite, suggestion } = this.props;
		return getDomainPriceRule( domainsWithPlansOnly, selectedSite, cart, suggestion );
	}

	renderDomain() {
		const { suggestion: { domain_name: domain }, isFeatured } = this.props;
		return (
			<h3 className="domain-registration-suggestion__title">
				{ domain }
				{ ! isFeatured ? this.getDomainFlags() : null }
			</h3>
		);
	}

	renderProgressBar() {
		const { suggestion: { isRecommended, isBestAlternative }, translate, isFeatured } = this.props;

		if ( ! isFeatured ) {
			return null;
		}

		let title, progressBarProps;
		if ( isRecommended ) {
			title = translate( 'Best Match' );
			progressBarProps = {
				color: NOTICE_GREEN,
				title,
				value: 90,
			};
		}

		if ( isBestAlternative ) {
			title = translate( 'Best Alternative' );
			progressBarProps = {
				title,
				value: 80,
			};
		}

		if ( title ) {
			return (
				<div className="domain-registration-suggestion__progress-bar">
					<ProgressBar { ...progressBarProps } />
					<span className="domain-registration-suggestion__progress-bar-text">{ title }</span>
				</div>
			);
		}
	}

	renderMatchReason() {
		const { suggestion: { domain_name: domain }, isFeatured } = this.props;

		if ( ! isFeatured || ! Array.isArray( this.props.suggestion.match_reasons ) ) {
			return null;
		}

		const matchReasons = parseMatchReasons( domain, this.props.suggestion.match_reasons );

		return (
			<div className="domain-registration-suggestion__match-reasons">
				{ matchReasons.map( ( phrase, index ) => (
					<div className="domain-registration-suggestion__match-reason" key={ index }>
						<Gridicon icon="checkmark" size={ 18 } />
						{ phrase }
					</div>
				) ) }
			</div>
		);
	}

	render() {
		const {
			domainsWithPlansOnly,
			isFeatured,
			suggestion: { domain_name: domain, product_slug: productSlug, cost },
		} = this.props;

		const extraClasses = classNames( { 'featured-domain-suggestion': isFeatured } );

		return (
			<DomainSuggestion
				extraClasses={ extraClasses }
				priceRule={ this.getPriceRule() }
				price={ productSlug && cost }
				domain={ domain }
				domainsWithPlansOnly={ domainsWithPlansOnly }
				onButtonClick={ this.onButtonClick }
				showExpandedPrice={ isFeatured }
				{ ...this.getButtonProps() }
			>
				{ this.renderDomain() }
				{ this.renderProgressBar() }
				{ this.renderMatchReason() }
			</DomainSuggestion>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( DomainRegistrationSuggestion ) );
