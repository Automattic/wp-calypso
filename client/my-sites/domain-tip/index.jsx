/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import React from 'react';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getSite, getSiteSlug } from 'state/sites/selectors';
import { getDomainsSuggestions, } from 'state/domains/suggestions/selectors';
import { currentUserHasFlag } from 'state/current-user/selectors';
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { FEATURE_CUSTOM_DOMAIN } from 'lib/plans/constants';
import { isFreePlan } from 'lib/products-values';

function getQueryObject( site, siteSlug ) {
	if ( ! site || ! siteSlug ) {
		return null;
	}
	return {
		query: siteSlug.split( '.' )[ 0 ],
		quantity: 1,
		vendor: abtest( 'domainSuggestionVendor' )
	};
}

const DomainTip = React.createClass( {

	propTypes: {
		className: React.PropTypes.string,
		event: React.PropTypes.string.isRequired,
		siteId: React.PropTypes.number.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired
	},

	getDefaultProps() {
		return {
			quantity: noop
		};
	},

	noticeShouldDisplay() {
		//bypass some of the upgrade nudge display logic
		return true;
	},

	domainUpgradeNudge() {
		return (
			<UpgradeNudge
				title={ this.translate( 'Get a free Custom Domain' ) }
				message={ this.translate( 'Custom domains are free when you upgrade to a Premium or Business plan.' ) }
				feature={ FEATURE_CUSTOM_DOMAIN }
				event={ this.props.event }
			/>
		);
	},

	render() {
		if ( ! this.props.site || this.props.site.jetpack || ! this.props.siteSlug ||
				this.props.domainsWithPlansOnly || ! isFreePlan( this.props.site.plan ) ) {
			return this.domainUpgradeNudge();
		}
		const classes = classNames( this.props.className, 'domain-tip' );
		const { query, quantity, vendor } = getQueryObject( this.props.site, this.props.siteSlug );
		const suggestion = this.props.suggestions ? this.props.suggestions[0] : null;
		return (
			<div className={ classes } >
				<QueryDomainsSuggestions
					query={ query }
					quantity={ quantity }
					vendor={ vendor } />
				{
					suggestion
						? <UpgradeNudge
						event={ `domain_tip_${ this.props.event }` }
						shouldDisplay={ this.noticeShouldDisplay }
						feature={ FEATURE_CUSTOM_DOMAIN }
						title={ this.translate( '{{span}}%(domain)s{{/span}} is available!', {
							args: { domain: suggestion.domain_name },
							components: {
								span: <span className="domain-tip__suggestion" />
							} } ) }
						message={ this.translate( 'Upgrade your plan to register a domain.' ) }
						href={ `/domains/add/${ this.props.siteSlug }` } />
						: this.domainUpgradeNudge()
				}
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const site = getSite( state, ownProps.siteId );
	const siteSlug = getSiteSlug( state, ownProps.siteId );
	const queryObject = getQueryObject( site, siteSlug );

	return {
		suggestions: queryObject && getDomainsSuggestions( state, queryObject ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		site: site,
		siteSlug: siteSlug
	};
} )( DomainTip );
