/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Children, Component } from 'react';
import store from 'store';
import { connect } from 'react-redux';
import { find, get, reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ChecklistBannerTask from './task';
import ChecklistShowShare from 'my-sites/checklist/share';
import Gauge from 'components/gauge';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const storeKeyForNeverShow = 'sitesNeverShowChecklistBanner';

export class ChecklistBanner extends Component {
	static propTypes = {
		isEligibleForDotcomChecklist: PropTypes.bool,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	state = { closed: false };

	handleClose = () => {
		const { siteId } = this.props;
		const sitesNeverShowBanner = store.get( storeKeyForNeverShow ) || {};
		sitesNeverShowBanner[ `${ siteId }` ] = true;
		store.set( storeKeyForNeverShow, sitesNeverShowBanner );

		this.setState( { closed: true } );

		this.props.track( 'calypso_checklist_banner_close', {
			site_id: siteId,
		} );
	};

	canShow() {
		if ( ! this.props.isEligibleForDotcomChecklist ) {
			return false;
		}

		if ( this.state.closed ) {
			return false;
		}

		const sitesNeverShowBanner = store.get( storeKeyForNeverShow );
		if ( get( sitesNeverShowBanner, String( this.props.siteId ) ) === true ) {
			return false;
		}

		return true;
	}

	render() {
		const { translate } = this.props;

		if ( ! this.canShow() ) {
			return null;
		}

		const childrenArray = Children.toArray( this.props.children );
		const total = childrenArray.length;
		const completeCount = reduce(
			childrenArray,
			( sum, child ) => ( !! child.props.completed ? sum + 1 : sum ),
			0
		);
		const isFinished = completeCount >= total;
		const completePercentage = Math.round( ! total ? 0 : ( completeCount / total ) * 100 );

		return (
			<Card className="checklist-banner">
				<div className="checklist-banner__gauge">
					<span className="checklist-banner__gauge-additional-text">{ translate( 'setup' ) }</span>
					<Gauge
						width={ 152 }
						height={ 152 }
						lineWidth={ 18 }
						percentage={ completePercentage }
						metric={ translate( 'completed' ) }
						colors={ [ '#ffffff', '#47b766' ] }
					/>
				</div>
				<div className="checklist-banner__progress">
					<span className="checklist-banner__progress-title">{ translate( 'Site setup' ) }</span>
					<span className="checklist-banner__progress-desc">
						{ translate( '%(percentage)s%% completed', {
							args: { percentage: completePercentage },
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
					<ProgressBar value={ completeCount } total={ total } color="#47b766" />
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
					find( childrenArray, child => ! child.props.completed )
				) }
			</Card>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		isEligibleForDotcomChecklist: isEligibleForDotcomChecklist( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( ChecklistBanner ) );
