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
import { isEligibleForDomainToPaidPlanUpsell } from 'state/selectors';
import SidebarBanner from 'my-sites/current-site/sidebar-banner';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { isDomainOnlySite } from 'state/selectors';

const impressionEventName = 'calypso_upgrade_nudge_impression';
const clickEventName = 'calypso_upgrade_nudge_cta_click';
const eventProperties = { cta_name: 'domain-to-paid-sidebar' };

export class DomainToPaidPlanNotice extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		translate: noop,
	};

	onClick = () => {
		this.props.recordTracksEvent( clickEventName, eventProperties );
	};

	render() {
		const { eligible, isConflicting, isDomainOnly, site, translate } = this.props;

		if ( ! site || ! eligible || isConflicting ) {
			return null;
		}

		const actionLink = isDomainOnly
			? `/start/site-selected/?siteSlug=${ encodeURIComponent(
					site.slug
				) }&siteId=${ encodeURIComponent( site.ID ) }`
			: `/plans/my-plan/${ site.slug }`;

		return (
			<SidebarBanner icon="info-outline" text={ translate( 'Upgrade your site and save.' ) }>
				<a onClick={ this.onClick } href={ actionLink }>
					<span>
						{ translate( 'Go' ) }
						<TrackComponentView
							eventName={ impressionEventName }
							eventProperties={ eventProperties }
						/>
					</span>
				</a>
			</SidebarBanner>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const isDomainOnly = isDomainOnlySite( state, site.ID );

	return {
		eligible: isEligibleForDomainToPaidPlanUpsell( state, site.ID ),
		isConflicting: isDomainOnly && endsWith( site.domain, '.wordpress.com' ),
		isDomainOnly,
		site,
	};
};
const mapDispatchToProps = { recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( DomainToPaidPlanNotice ) );
