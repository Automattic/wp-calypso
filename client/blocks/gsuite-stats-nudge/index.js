/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import Card from 'components/card';
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

	getHeaderCopy() {
		const { domainSlug, translate } = this.props;

		switch ( abtest( 'gSuiteStatsNudge' ) ) {
			case 'copy1':
				return translate( 'Get a mailbox powered by G Suite' );
			case 'copy2':
				return translate(
					'Get email for your domain powered by G Suite for just {{em}}$6/mo{{/em}} $5/mo – limited time offer!',
					{ components: { em: <em /> } }
				);
			case 'copy3':
				return translate(
					'Customers can’t reach you at contact@%s – click here to add a mailbox for just $5/mo',
					{ args: domainSlug }
				);
			case 'copy4':
				return translate( 'Professional email and so much more' );
			default:
		}
	}

	render() {
		const { domainSlug, siteSlug, translate } = this.props;
		const url = '/domains/manage/email/' + siteSlug;

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
						<h1 className="gsuite-stats-nudge__title">{ this.getHeaderCopy() }</h1>
						{
							<p>
								{ translate(
									"Let customers reach you at {{strong}}contact@%s{{/strong}}. We've partnered with Google to offer you email, storage, docs, calendars, and more integrated with your site.",
									{
										args: domainSlug,
										components: { strong: <strong /> },
									}
								) }
							</p>
						}
						<div className="gsuite-stats-nudge__button-row">
							<Button href={ url } primary onClick={ this.onStartNowClick }>
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
