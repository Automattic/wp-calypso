/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { Button, Card } from '@automattic/components';
import { emailManagement } from 'my-sites/email/paths';
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';
import QueryPreferences from 'components/data/query-preferences';
import SectionHeader from 'components/section-header';
import { dismissNudge } from './actions';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';

/**
 * Style dependencies
 */
import './style.scss';

class GSuiteStatsNudge extends Component {
	static propTypes = {
		domainSlug: PropTypes.string.isRequired,
		isDismissed: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.recordView();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId && this.props.siteId && this.props.siteId !== prevProps.siteId ) {
			this.recordView();
		}
	}

	recordView() {
		if ( this.isVisible() ) {
			this.props.recordTracksEvent( 'calypso_gsuite_stats_nudge_view' );
		}
	}

	recordClick = eventName => {
		this.props.recordTracksEvent( eventName );
	};

	onDismissClick = () => {
		this.recordClick( 'calypso_gsuite_stats_nudge_dismiss_icon_click' );
		this.props.dismissNudge();
	};

	onStartNowClick = () => {
		this.recordClick( 'calypso_gsuite_stats_nudge_start_now_button_click' );
	};

	isVisible() {
		return ! this.props.isDismissed;
	}

	render() {
		const { domainSlug, siteSlug, translate } = this.props;
		const url = emailManagement( siteSlug );

		if ( ! this.isVisible() ) {
			return null;
		}

		return (
			<Card className="gsuite-stats-nudge">
				<QueryPreferences />

				<Gridicon
					icon="cross"
					className="gsuite-stats-nudge__close-icon"
					onClick={ this.onDismissClick }
				/>

				<SectionHeader
					className="gsuite-stats-nudge__header"
					label={ translate( 'Recommendations from WordPress.com' ) }
				/>

				<div className="gsuite-stats-nudge__body">
					<div className="gsuite-stats-nudge__image-wrapper">
						<img
							className="gsuite-stats-nudge__image"
							src="/calypso/images/g-suite/g-suite-stats-banner-illustration.svg"
							alt={ translate( 'Get G Suite' ) }
						/>
					</div>

					<div className="gsuite-stats-nudge__info">
						<h1 className="gsuite-stats-nudge__title">
							{ translate( 'Get custom email addresses with %(domain)s', {
								args: { domain: domainSlug },
							} ) }
						</h1>

						{
							<p>
								{ translate(
									"An email address like {{strong}}contact@%(domain)s{{/strong}} looks pro and helps customers trust you. We've partnered with Google to offer you email, storage, docs, calendars, and more integrated with your site.",
									{
										args: { domain: domainSlug },
										components: { strong: <strong /> },
									}
								) }
							</p>
						}

						<div className="gsuite-stats-nudge__button-row">
							<Button
								href={ url }
								primary={ this.props.primaryButton }
								onClick={ this.onStartNowClick }
							>
								{ translate( 'Get G Suite' ) }
							</Button>
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isDismissed: isGSuiteStatsNudgeDismissed( state, ownProps.siteId ),
	} ),
	{
		dismissNudge,
		recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
	}
)( localize( GSuiteStatsNudge ) );
