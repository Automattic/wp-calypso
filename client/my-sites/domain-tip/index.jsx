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
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
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
		siteId: React.PropTypes.number.isRequired
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

	render() {
		if ( ! this.props.site || this.props.site.jetpack || ! this.props.siteSlug ||
				abtest( 'domainsWithPlansOnly' ) !== 'plansOnly' || ! isFreePlan( this.props.site.plan ) ) {
			return null;
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
					suggestion && <UpgradeNudge
						event="domain-tip"
						shouldDisplay={ this.noticeShouldDisplay }
						feature={ FEATURE_CUSTOM_DOMAIN }
						title={ this.translate( '{{span}}%(domain)s{{/span}} is available!', {
							args: { domain: suggestion.domain_name },
							components: {
								span: <span className="domain-tip__suggestion" />
							} } ) }
						message={ this.translate( 'Upgrade your plan to register a domain.' ) }
						href={ `/domains/add/${ this.props.siteSlug }` }
					/>
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
		site: site,
		siteSlug: siteSlug
	};
} )( DomainTip );
