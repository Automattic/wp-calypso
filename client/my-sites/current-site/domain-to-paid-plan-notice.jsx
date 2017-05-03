/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import {
	noop,
} from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getSelectedSiteId } from 'state/ui/selectors';
import { eligibleForDomainToPaidPlanUpsell } from 'state/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

const impressionEventName = 'calypso_upgrade_nudge_impression';
const clickEventName = 'calypso_upgrade_nudge_cta_click';
const eventProperties = { cta_name: 'domain-to-paid-sidebar' };

export class DomainToPaidPlanNotice extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	}

	static defaultProps = {
		translate: noop,
	}

	onClick = () => {
		this.props.recordTracksEvent( clickEventName, eventProperties );
	}

	render() {
		const { eligible, site, translate } = this.props;

		if ( ! site || ! eligible || abtest( 'domainToPaidPlanUpsellNudge' ) === 'skip' ) {
			return null;
		}

		return (
			<Notice isCompact status="is-success" icon="info-outline">
				{ translate( 'Upgrade your site and save.' ) }
				<NoticeAction onClick={ this.onClick } href={ `/plans/my-plan/${ site.slug }` }>
					{ translate( 'Go' ) }
					<TrackComponentView eventName={ impressionEventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		eligible: eligibleForDomainToPaidPlanUpsell( state, getSelectedSiteId( state ) ),
	};
};
const mapDispatchToProps = { recordTracksEvent };

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( localize( DomainToPaidPlanNotice ) );
