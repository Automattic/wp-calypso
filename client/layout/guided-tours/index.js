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
import scrollTo from 'lib/scroll-to';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';
import { errorNotice } from 'state/notices/actions';
import { getScrollableSidebar, targetForSlug } from './positioning';
import {
	BasicStep,
	FirstStep,
	LinkStep,
	FinishStep,
	ActionStep,
} from './steps';
import wait from './wait';
import QueryPreferences from 'components/data/query-preferences';
import RootChild from 'components/root-child';

const debug = debugFactory( 'calypso:guided-tours' );

class GuidedTours extends Component {
	constructor() {
		super();
		this.bind( 'next', 'quit', 'finish' );
	}

	bind( ...methods ) {
		methods.forEach( m => this[ m ] = this[ m ].bind( this ) );
	}

	componentDidMount() {
		const { stepConfig } = this.props.tourState;
		this.updateTarget( stepConfig );
	}

	componentWillReceiveProps( nextProps ) {
		const { stepConfig } = nextProps.tourState;

		stepConfig.continueIf &&
			stepConfig.continueIf( nextProps.state ) &&
			this.next();
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

	next() {
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

	quit( options = {} ) {
		// TODO: put into step specific callback?
		const sidebar = getScrollableSidebar();
		scrollTo( { y: 0, container: sidebar } );

		this.currentTarget && this.currentTarget.classList.remove( 'guided-tours__overlay' );
		this.props.quitGuidedTour( Object.assign( {
			stepName: this.props.tourState.stepName,
			tour: this.props.tourState.tour,
		}, options ) );
	}

	finish() {
		this.quit( { finished: true } );
	}

	render() {
		const { stepConfig, shouldShow } = this.props.tourState;

		if ( ! shouldShow || ! stepConfig ) {
			return null;
		}

		debug( 'GuidedTours#render() tourState', this.props.tourState );

		const StepComponent = {
			FirstStep,
			ActionStep,
			LinkStep,
			FinishStep,
		}[ stepConfig.type ] || BasicStep;

		return (
			<RootChild>
				<div className="guided-tours">
					<QueryPreferences />
					<StepComponent
						{ ...stepConfig }
						key={ stepConfig.target }
						targetSlug={ stepConfig.target }
						onNext={ this.next }
						onQuit={ this.quit }
						onFinish={ this.finish } />
				</div>
			</RootChild>
		);
	}
}

export default connect( ( state ) => ( {
	tourState: getGuidedTourState( state ),
	state,
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
	errorNotice,
} )( localize( GuidedTours ) );
