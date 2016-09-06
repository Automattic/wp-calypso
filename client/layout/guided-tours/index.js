/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AllTours from 'layout/guided-tours/config';
import QueryPreferences from 'components/data/query-preferences';
import RootChild from 'components/root-child';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { getScrollableSidebar } from './positioning';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';

class GuidedTours extends Component {
	constructor() {
		super();
	}

	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	next = ( tour, nextStepName ) => {
		this.props.nextGuidedTourStep( {
			stepName: nextStepName,
			tour: tour,
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
							tourName={ tourName }
							stepName={ stepName }
							isValid={ this.props.isValid }
							next={ this.next }
							quit={ this.quit } />
				</div>
			</RootChild>
		);
	}
}

export default connect( ( state ) => ( {
	tourState: getGuidedTourState( state ),
	isValid: ( when ) => !! when( state ),
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
} )( localize( GuidedTours ) );
