/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import { tracks } from 'lib/analytics';
import AllTours from 'layout/guided-tours/config';
import QueryPreferences from 'components/data/query-preferences';
import RootChild from 'components/root-child';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { getLastAction } from 'state/ui/action-log/selectors';
import { getSectionName, isSectionLoading } from 'state/ui/selectors';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';

class GuidedTours extends Component {
	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	start = ( { tour, tourVersion: tour_version } ) => {
		if ( tour && tour_version ) {
			tracks.recordEvent( 'calypso_guided_tours_start', {
				tour,
				tour_version,
			} );
		}
	}

	next = ( { step, tour, tourVersion, nextStepName, skipping = false } ) => {
		if ( ! skipping && step ) {
			tracks.recordEvent( 'calypso_guided_tours_seen_step', {
				tour,
				step,
				tour_version: tourVersion,
			} );
		}

		defer( () => {
			this.props.nextGuidedTourStep( {
				tour,
				stepName: nextStepName,
			} );
		} );
	}

	quit = ( { step, tour, tourVersion: tour_version, isLastStep } ) => {
		if ( step ) {
			tracks.recordEvent( 'calypso_guided_tours_seen_step', {
				tour,
				step,
				tour_version,
			} );
		}

		tracks.recordEvent( `calypso_guided_tours_${ isLastStep ? 'finished' : 'quit' }`, {
			step,
			tour,
			tour_version,
		} );

		this.props.quitGuidedTour( {
			tour,
			stepName: step,
			finished: isLastStep,
		} );
	}

	render() {
		const {
			tour: tourName,
			stepName = 'init',
			shouldShow
		} = this.props.tourState;

		if ( ! shouldShow ) {
			return null;
		}

		return (
			<RootChild>
				<div className="guided-tours">
					<QueryPreferences />
					<AllTours
							sectionName={ this.props.sectionName }
							shouldPause={ this.props.isSectionLoading }
							tourName={ tourName }
							stepName={ stepName }
							lastAction={ this.props.lastAction }
							isValid={ this.props.isValid }
							next={ this.next }
							quit={ this.quit }
							start={ this.start } />
				</div>
			</RootChild>
		);
	}
}

export default connect( ( state ) => ( {
	sectionName: getSectionName( state ),
	isSectionLoading: isSectionLoading( state ),
	tourState: getGuidedTourState( state ),
	isValid: ( when ) => !! when( state ),
	lastAction: getLastAction( state ),
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
} )( localize( GuidedTours ) );
