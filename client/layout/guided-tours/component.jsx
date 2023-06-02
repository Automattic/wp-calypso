import { RootChild } from '@automattic/components';
import { defer } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { nextGuidedTourStep, quitGuidedTour } from 'calypso/state/guided-tours/actions';
import { getGuidedTourState } from 'calypso/state/guided-tours/selectors';
import { getLastAction } from 'calypso/state/ui/action-log/selectors';
import { getSectionName, isSectionLoading } from 'calypso/state/ui/selectors';
import AllTours from './all-tours';
import './style.scss';

class GuidedToursComponent extends Component {
	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	start = ( { step, tour, tourVersion: tour_version } ) => {
		if ( tour && tour_version ) {
			this.props.dispatch( nextGuidedTourStep( { step, tour } ) );
			recordTracksEvent( 'calypso_guided_tours_start', { tour, tour_version } );
		}
	};

	next = ( { step, tour, tourVersion, nextStepName, skipping = false } ) => {
		if ( ! skipping && step ) {
			recordTracksEvent( 'calypso_guided_tours_seen_step', {
				tour,
				step,
				tour_version: tourVersion,
			} );
		}

		defer( () => {
			this.props.dispatch( nextGuidedTourStep( { tour, stepName: nextStepName } ) );
		} );
	};

	quit = ( { step, tour, tourVersion: tour_version, isLastStep } ) => {
		if ( step ) {
			recordTracksEvent( 'calypso_guided_tours_seen_step', {
				tour,
				step,
				tour_version,
			} );
		}

		recordTracksEvent( `calypso_guided_tours_${ isLastStep ? 'finished' : 'quit' }`, {
			step,
			tour,
			tour_version,
		} );

		this.props.dispatch( quitGuidedTour( { tour, stepName: step, finished: isLastStep } ) );
	};

	render() {
		const { tour: tourName, stepName = 'init', shouldShow } = this.props.tourState;

		if ( ! shouldShow ) {
			return null;
		}

		return (
			<RootChild>
				<div className="guided-tours__root">
					<QueryPreferences />
					<AllTours
						sectionName={ this.props.sectionName }
						shouldPause={ this.props.shouldPause }
						tourName={ tourName }
						stepName={ stepName }
						lastAction={ this.props.lastAction }
						isValid={ this.props.isValid }
						next={ this.next }
						quit={ this.quit }
						start={ this.start }
						dispatch={ this.props.dispatch }
					/>
				</div>
			</RootChild>
		);
	}
}

const getTourWhenState = ( state ) => ( when ) => !! when( state );

export default connect( ( state ) => {
	const tourState = getGuidedTourState( state );
	const shouldPause = isSectionLoading( state ) || tourState.isPaused;
	return {
		sectionName: getSectionName( state ),
		shouldPause,
		tourState,
		isValid: getTourWhenState( state ),
		lastAction: getLastAction( state ),
	};
} )( GuidedToursComponent );
