/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { getSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import { getDomainsSuggestions } from 'calypso/state/domains/suggestions/selectors';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import QueryDomainsSuggestions from 'calypso/components/data/query-domains-suggestions';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { FEATURE_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { isFreePlanProduct } from 'calypso/lib/products-values';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';

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
			<UpsellNudge
				event={ `domain_tip_${ this.props.event }` }
				feature={ FEATURE_CUSTOM_DOMAIN }
				forceDisplay
				description={ this.props.translate( 'Upgrade your plan to register a custom domain.' ) }
				showIcon
				title={ this.props.translate( 'Get a custom domain' ) }
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksClickName="calypso_upgrade_nudge_cta_click"
			/>
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
			<Fragment>
				<QueryDomainsSuggestions { ...this.props.queryObject } />
				<UpsellNudge
					event={ `domain_tip_${ this.props.event }` }
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
					feature={ FEATURE_CUSTOM_DOMAIN }
					href={ `/domains/add/${ this.props.siteSlug }` }
					description={
						this.props.hasDomainCredit
							? this.props.translate(
									'Your plan includes a free custom domain for one year. Grab this one!'
							  )
							: this.props.translate( 'Purchase a custom domain for your site.' )
					}
					forceDisplay
					title={ title }
					showIcon
				/>
			</Fragment>
		);
	}
}

const ConnectedDomainTip = connect( ( state, ownProps ) => {
	const site = getSite( state, ownProps.siteId );
	const siteSlug = getSiteSlug( state, ownProps.siteId );
	const queryObject = getQueryObject( site, siteSlug, ownProps.vendor );
	const domainsWithPlansOnly = currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY );
	const isPaidWithoutDomainCredit =
		site &&
		siteSlug &&
		! isFreePlanProduct( site.plan ) &&
		! hasDomainCredit( state, ownProps.siteId );
	const isIneligible = ! site || ! siteSlug || site.jetpack || isPaidWithoutDomainCredit;

	return {
		hasDomainCredit: hasDomainCredit( state, ownProps.siteId ),
		isIneligible,
		queryObject,
		shouldNudgePlanUpgrade:
			! isIneligible && isFreePlanProduct( site.plan ) && domainsWithPlansOnly,
		site,
		siteSlug,
		suggestions: queryObject && getDomainsSuggestions( state, queryObject ),
	};
} )( localize( DomainTip ) );

ConnectedDomainTip.defaultProps = {
	vendor: getSuggestionsVendor(),
};

export default ConnectedDomainTip;
