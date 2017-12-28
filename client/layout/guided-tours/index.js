/** @format */

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
import { tracks } from 'client/lib/analytics';
import AllTours from 'client/layout/guided-tours/config';
import QueryPreferences from 'client/components/data/query-preferences';
import RootChild from 'client/components/root-child';
import { getGuidedTourState } from 'client/state/ui/guided-tours/selectors';
import { getLastAction } from 'client/state/ui/action-log/selectors';
import { getSectionName, isSectionLoading } from 'client/state/ui/selectors';
import getInitialQueryArguments from 'client/state/selectors/get-initial-query-arguments';
import {
	nextGuidedTourStep,
	quitGuidedTour,
	resetGuidedToursHistory,
} from 'client/state/ui/guided-tours/actions';

class GuidedTours extends Component {
	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestedTour === 'reset' && this.props.requestedTour !== 'reset' ) {
			this.props.resetGuidedToursHistory();
		}
	}

	start = ( { step, tour, tourVersion: tour_version } ) => {
		if ( tour && tour_version ) {
			this.props.nextGuidedTourStep( { step, tour } );
			tracks.recordEvent( 'calypso_guided_tours_start', {
				tour,
				tour_version,
			} );
		}
	};

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
	};

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
	};

	render() {
		const { tour: tourName, stepName = 'init', shouldShow } = this.props.tourState;

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
						start={ this.start }
					/>
				</div>
			</RootChild>
		);
	}
}

export default connect(
	state => ( {
		sectionName: getSectionName( state ),
		isSectionLoading: isSectionLoading( state ),
		tourState: getGuidedTourState( state ),
		isValid: when => !! when( state ),
		lastAction: getLastAction( state ),
		requestedTour: getInitialQueryArguments( state ).tour,
	} ),
	{
		nextGuidedTourStep,
		quitGuidedTour,
		resetGuidedToursHistory,
	}
)( localize( GuidedTours ) );
