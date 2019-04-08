/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Children, Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ChecklistBannerTask from './task';
import ChecklistShowShare from 'my-sites/checklist/share';
import Gauge from 'components/gauge';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { setNeverShowBannerStatus } from './never-show';
import { recordTracksEvent } from 'state/analytics/actions';
import getSiteChecklistIsLoading from 'state/selectors/get-site-checklist-is-loading';

export class ChecklistBanner extends Component {
	static propTypes = {
		isEligibleForDotcomChecklist: PropTypes.bool,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	state = { closed: false };

	handleClose = () => {
		const { siteId } = this.props;
		setNeverShowBannerStatus( siteId, true );

		this.setState( { closed: true } );

		this.props.track( 'calypso_checklist_banner_close', {
			site_id: siteId,
		} );
	};

	render() {
		if ( this.state.closed || this.props.isLoading ) {
			return null;
		}

		const { translate, taskList } = this.props;
		const childrenArray = Children.toArray( this.props.children );
		const { total, completed, percentage } = taskList.getCompletionStatus();
		const firstIncomplete = taskList.getFirstIncompleteTask();
		const isFinished = ! firstIncomplete;

		return (
			<Card className="checklist-banner">
				<div className="checklist-banner__gauge animate__fade-in">
					<span className="checklist-banner__gauge-additional-text">{ translate( 'setup' ) }</span>
					<Gauge
						width={ 152 }
						height={ 152 }
						lineWidth={ 18 }
						percentage={ percentage }
						metric={ translate( 'completed' ) }
						colors={ [ '#ffffff', '#008a00' ] }
					/>
				</div>
				<div className="checklist-banner__progress">
					<span className="checklist-banner__progress-title">{ translate( 'Site setup' ) }</span>
					<span className="checklist-banner__progress-desc">
						{ translate( '%(percentage)s%% completed', {
							args: { percentage: percentage },
						} ) }

						{ isFinished && (
							<Button
								borderless
								className="checklist-banner__close-mobile"
								onClick={ this.handleClose }
							>
								<Gridicon size={ 24 } icon="cross" color="#87a6bc" />
							</Button>
						) }
					</span>
					<ProgressBar value={ completed } total={ total } color="#47b766" />
				</div>
				{ isFinished ? (
					<>
						<ChecklistBannerTask
							bannerImageSrc="/calypso/images/stats/tasks/ready-to-share.svg"
							description={ translate(
								'We did it! You have completed {{a}}all the tasks{{/a}} on our checklist.',
								{
									components: {
										a: <a href={ `/checklist/${ this.props.siteSlug }` } />,
									},
								}
							) }
							title={ translate( 'Your site is ready to share' ) }
						>
							<ChecklistShowShare
								className="checklist-banner__actions"
								siteSlug={ this.props.siteSlug }
							/>
						</ChecklistBannerTask>
						<Button borderless className="checklist-banner__close" onClick={ this.handleClose }>
							<Gridicon size={ 24 } icon="cross" color="#87a6bc" />
						</Button>
					</>
				) : (
					childrenArray.find( child => child.props.id === firstIncomplete.id )
				) }
			</Card>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		isLoading: getSiteChecklistIsLoading( state ),
	};
};

const mapDispatchToProps = {
	track: recordTracksEvent,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ChecklistBanner ) );
