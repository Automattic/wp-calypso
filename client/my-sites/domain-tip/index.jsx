/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getSite, getSiteSlug } from 'state/sites/selectors';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { getDomainsSuggestions } from 'state/domains/suggestions/selectors';
import { currentUserHasFlag } from 'state/current-user/selectors';
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { FEATURE_CUSTOM_DOMAIN } from 'lib/plans/constants';
import { isFreePlan } from 'lib/products-values';

function getQueryObject( site, siteSlug, vendor ) {
	if ( ! site || ! siteSlug ) {
		return null;
	}
	return {
		quantity: 1,
		query: siteSlug.split( '.' )[ 0 ],
		recommendationContext: ( site.name || '' ).replace( ' ', ',' ).toLocaleLowerCase(),
		vendor,
	};
}

class DomainTip extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		event: PropTypes.string.isRequired,
		hasDomainCredit: PropTypes.bool,
		isIneligible: PropTypes.bool,
		shouldNudgePlanUpgrade: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
		queryObject: PropTypes.shape( {
			quantity: PropTypes.number,
			query: PropTypes.string,
			recommendationContext: PropTypes.string,
			vendor: PropTypes.string,
		} ),
		vendor: PropTypes.string,
	};

	renderPlanUpgradeNudge() {
		return (
			<div className={ classNames( 'domain-tip', this.props.className ) }>
				<UpgradeNudge
					event={ `domain_tip_${ this.props.event }` }
					feature={ FEATURE_CUSTOM_DOMAIN }
					shouldDisplay
					message={ this.props.translate( 'Upgrade your plan to register a custom domain.' ) }
					title={ this.props.translate( 'Get a custom domain' ) }
				/>
			</div>
		);
	}

	render() {
		if ( this.props.isIneligible ) {
			return null;
		}

		if ( this.props.shouldNudgePlanUpgrade ) {
			return this.renderPlanUpgradeNudge();
		}

		const suggestion = Array.isArray( this.props.suggestions ) ? this.props.suggestions[ 0 ] : null;
		let title = this.props.translate( 'Get a custom domain' );
		if ( suggestion ) {
			title = this.props.translate( '{{span}}%(domain)s{{/span}} is available!', {
				args: { domain: suggestion.domain_name },
				components: { span: <span className="domain-tip__suggestion" /> },
			} );
		}

		return (
			<div className={ classNames( 'domain-tip', this.props.className ) }>
				<QueryDomainsSuggestions { ...this.props.queryObject } />
				<UpgradeNudge
					event={ `domain_tip_${ this.props.event }` }
					feature={ FEATURE_CUSTOM_DOMAIN }
					href={ `/domains/add/${ this.props.siteSlug }` }
					message={
						this.props.hasDomainCredit
							? this.props.translate(
									'Your plan includes a free custom domain for one year. Grab this one!'
							  )
							: this.props.translate( 'Purchase a custom domain for your site.' )
					}
					shouldDisplay
					title={ title }
				/>
			</div>
		);
	}
}

const ConnectedDomainTip = connect( ( state, ownProps ) => {
	const site = getSite( state, ownProps.siteId );
	const siteSlug = getSiteSlug( state, ownProps.siteId );
	const queryObject = getQueryObject( site, siteSlug, ownProps.vendor );
	const domainsWithPlansOnly = currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY );
	const isPaidWithoutDomainCredit =
		site && siteSlug && ! isFreePlan( site.plan ) && ! hasDomainCredit( state, ownProps.siteId );
	const isIneligible = ! site || ! siteSlug || site.jetpack || isPaidWithoutDomainCredit;

	return {
		hasDomainCredit: hasDomainCredit( state, ownProps.siteId ),
		isIneligible,
		queryObject,
		shouldNudgePlanUpgrade: ! isIneligible && isFreePlan( site.plan ) && domainsWithPlansOnly,
		site,
		siteSlug,
		suggestions: queryObject && getDomainsSuggestions( state, queryObject ),
	};
} )( localize( DomainTip ) );

ConnectedDomainTip.defaultProps = {
	vendor: 'domainsbot',
};

export default ConnectedDomainTip;
