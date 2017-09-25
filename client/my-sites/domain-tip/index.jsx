/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryDomainsSuggestions from 'components/data/query-domains-suggestions';
import { FEATURE_CUSTOM_DOMAIN } from 'lib/plans/constants';
import { isFreePlan } from 'lib/products-values';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { getDomainsSuggestions } from 'state/domains/suggestions/selectors';
import { getSite, getSiteSlug } from 'state/sites/selectors';

function getQueryObject( site, siteSlug ) {
	if ( ! site || ! siteSlug ) {
		return null;
	}
	return {
		query: siteSlug.split( '.' )[ 0 ],
		quantity: 1,
		vendor: 'domainsbot'
	};
}

class DomainTip extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		event: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		quantity: noop,
	};

	noticeShouldDisplay = () => {
		// bypass some of the upgrade nudge display logic
		return true;
	};

	domainUpgradeNudge() {
		const { event, translate } = this.props;

		return (
			<UpgradeNudge
				title={ translate( 'Get a free Custom Domain' ) }
				message={ translate( 'Custom domains are free when you upgrade to a Premium or Business plan.' ) }
				feature={ FEATURE_CUSTOM_DOMAIN }
				event={ event }
			/>
		);
	}

	render() {
		const {
			className,
			domainsWithPlansOnly,
			event,
			site,
			siteSlug,
			suggestions,
			translate
		} = this.props;

		if ( ! site || site.jetpack || ! siteSlug || domainsWithPlansOnly || ! isFreePlan( site.plan ) ) {
			return this.domainUpgradeNudge();
		}

		const classes = classNames( className, 'domain-tip' );
		const { query, quantity, vendor } = getQueryObject( site, siteSlug );
		const suggestion = suggestions ? suggestions[ 0 ] : null;

		return (
			<div className={ classes }>
				<QueryDomainsSuggestions
					query={ query }
					quantity={ quantity }
					vendor={ vendor }
				/>
				{
					suggestion
						? <UpgradeNudge
							event={ `domain_tip_${ event }` }
							shouldDisplay={ this.noticeShouldDisplay }
							feature={ FEATURE_CUSTOM_DOMAIN }
							title={ translate( '{{span}}%(domain)s{{/span}} is available!', {
								args: { domain: suggestion.domain_name },
								components: {
									span: <span className="domain-tip__suggestion" />
								}
							} ) }
							message={ translate( 'Upgrade your plan to register a domain.' ) }
							href={ `/domains/add/${ siteSlug }` }
						/>
						: this.domainUpgradeNudge()
				}
			</div>
		);
	}
}

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
} )( localize( DomainTip ) );
