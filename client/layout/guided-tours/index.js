/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import RootChild from 'components/root-child';
import scrollTo from 'lib/scroll-to';
import wait from './wait';
import { errorNotice } from 'state/notices/actions';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { getScrollableSidebar, targetForSlug } from './positioning';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';

import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';
import { ThemesTour } from 'layout/guided-tours/themes-tour';

// move to guided-tours/config or equivalent
const AllTours = combineTours( {
	main: MainTour,
	themes: ThemesTour
} );

const debug = debugFactory( 'calypso:guided-tours' );

class GuidedTours extends Component {
	constructor() {
		super();
	}

	componentDidMount() {
		const { stepConfig } = this.props.tourState;
		this.updateTarget( stepConfig );
	}

	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	componentWillUpdate( nextProps ) {
		const { stepConfig } = nextProps.tourState;
		this.updateTarget( stepConfig );
	}

	updateTarget( step ) {
		this.currentTarget = step && step.target && targetForSlug( step.target );
	}

	next = () => {
		const nextStepName = this.props.tourState.stepConfig.next;
		const nextStepConfig = this.props.tourState.nextStepConfig;

		const nextTargetFound = () => {
			if ( nextStepConfig && nextStepConfig.target ) {
				const target = targetForSlug( nextStepConfig.target );
				return target && target.getBoundingClientRect().left >= 0;
			}
			return true;
		};
		const proceedToNextStep = () => {
			this.props.nextGuidedTourStep( {
				stepName: nextStepName,
				tour: this.props.tourState.tour,
			} );
		};
		const abortTour = () => {
			const ERROR_WAITED_TOO_LONG = 'waited too long for next target';
			debug( ERROR_WAITED_TOO_LONG );
			this.props.errorNotice(
				this.props.translate( 'There was a problem with the tour — sorry!' ),
				{ duration: 8000 }
			);
			this.quit( { error: ERROR_WAITED_TOO_LONG } );
		};
		defer( () => wait( { condition: nextTargetFound, consequence: proceedToNextStep, onError: abortTour } ) );
	}

	quit = ( options = {} ) => {
		// TODO: put into step specific callback?
		const sidebar = getScrollableSidebar();
		scrollTo( { y: 0, container: sidebar } );

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
	isValid: ( context ) => !! context( state ),
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
	errorNotice,
} )( localize( GuidedTours ) );
