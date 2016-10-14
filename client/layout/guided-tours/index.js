/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defer, last } from 'lodash';

/**
 * Internal dependencies
 */
import AllTours from 'layout/guided-tours/config';
import QueryPreferences from 'components/data/query-preferences';
import RootChild from 'components/root-child';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { getActionLog } from 'state/ui/action-log/selectors';
import { isSectionLoading } from 'state/ui/selectors';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';

class GuidedTours extends Component {
	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	next = ( tour, nextStepName ) => {
		defer( () => {
			this.props.nextGuidedTourStep( {
				stepName: nextStepName,
				tour: tour,
			} );
		} );
	}

	quit = ( options = {} ) => {
		this.props.quitGuidedTour( Object.assign( {
			stepName: this.props.tourState.stepName,
			tour: this.props.tourState.tour,
		}, options ) );
	}

	finish = () => {
		this.quit( { finished: true } );
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
							shouldPause={ this.props.isSectionLoading }
							tourName={ tourName }
							stepName={ stepName }
							lastAction={ this.props.lastAction }
							isValid={ this.props.isValid }
							next={ this.next }
							quit={ this.quit } />
				</div>
			</RootChild>
		);
	}
}

export default connect( ( state ) => ( {
	isSectionLoading: isSectionLoading( state ),
	tourState: getGuidedTourState( state ),
	isValid: ( when ) => !! when( state ),
	// TODO(mcsf): make it a cached selector:
	lastAction: last( getActionLog( state ) ),
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
} )( localize( GuidedTours ) );
