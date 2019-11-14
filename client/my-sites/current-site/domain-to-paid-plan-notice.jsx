/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { endsWith, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import isEligibleForDomainToPaidPlanUpsell from 'state/selectors/is-eligible-for-domain-to-paid-plan-upsell';
import SidebarBanner from 'my-sites/current-site/sidebar-banner';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { isJetpackSite } from 'state/sites/selectors';

export class DomainToPaidPlanNotice extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		translate: noop,
	};

	render() {
		const { eligible, isConflicting, isDomainOnly, isJetpack, site, translate } = this.props;

		if ( ! site || ! eligible || isConflicting ) {
			return null;
		}

		const href = isDomainOnly
			? `/start/site-selected/?siteSlug=${ encodeURIComponent(
					site.slug
			  ) }&siteId=${ encodeURIComponent( site.ID ) }`
			: `/plans/${ site.slug }`;

		const text = isJetpack
			? translate( 'Upgrade for full site backups.' )
			: translate( 'Upgrade your site and save.' );

		return (
			<SidebarBanner
				ctaName="domain-to-paid-sidebar"
				ctaText={ translate( 'Go' ) }
				href={ href }
				icon="info-outline"
				text={ text }
			/>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const isDomainOnly = isDomainOnlySite( state, site.ID );
	const isJetpack = isJetpackSite( state, site.ID );

	return {
		eligible: isEligibleForDomainToPaidPlanUpsell( state, site.ID ),
		isConflicting: isDomainOnly && endsWith( site.domain, '.wordpress.com' ),
		isDomainOnly,
		site,
		isJetpack,
	};
};
const mapDispatchToProps = null;

export default connect( mapStateToProps, mapDispatchToProps )( localize( DomainToPaidPlanNotice ) );
