/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import scrollTo from 'lib/scroll-to';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { nextGuidedTourStep, quitGuidedTour } from 'state/ui/guided-tours/actions';
import { errorNotice } from 'state/notices/actions';
import { query } from './positioning';
import {
	BasicStep,
	FirstStep,
	LinkStep,
	FinishStep,
	ActionStep,
} from './steps';
import wait from './wait';

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

	shouldComponentUpdate( nextProps ) {
		return this.props.tourState !== nextProps.tourState;
	}

	componentWillUpdate( nextProps ) {
		const { stepConfig } = nextProps.tourState;
		this.updateTarget( stepConfig );
	}

	updateTarget( step ) {
		this.tipTargets = this.getTipTargets();
		this.currentTarget = step && step.target
			? this.tipTargets[ step.target ]
			: null;
	}

	getTipTargets() {
		const tipTargetDomNodes = query( '[data-tip-target]' );
		return tipTargetDomNodes.reduce( ( tipTargets, node ) => Object.assign( tipTargets, {
			[ node.getAttribute( 'data-tip-target' ) ]: node
		} ), {} );
	}

	next() {
		const nextStepName = this.props.tourState.stepConfig.next;
		const nextStepConfig = this.props.tourState.nextStepConfig;

		const nextTargetFound = () => {
			if ( nextStepConfig && nextStepConfig.target ) {
				const target = this.getTipTargets()[nextStepConfig.target];
				return target && target.getBoundingClientRect().left >= 0;
			}
			return true;
		};
		const proceedToNextStep = () => {
			this.props.nextGuidedTourStep( { stepName: nextStepName } );
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
		wait( { condition: nextTargetFound, consequence: proceedToNextStep, onError: abortTour } );
	}

	quit( options = {} ) {
		// TODO: put into step specific callback?
		const sidebar = query( '#secondary .sidebar' )[ 0 ];
		scrollTo( { y: 0, container: sidebar } );

		this.currentTarget && this.currentTarget.classList.remove( 'guided-tours__overlay' );
		this.props.quitGuidedTour( Object.assign( {
			stepName: this.props.tourState.stepName,
		}, options ) );
	}

	finish() {
		this.quit( { finished: true } );
	}

	render() {
		const { stepConfig } = this.props.tourState;
		debug( 'GuidedTours#render() tourState', this.props.tourState );

		if ( ! stepConfig ) {
			return null;
		}

		const StepComponent = {
			FirstStep,
			ActionStep,
			LinkStep,
			FinishStep,
		}[ stepConfig.type ] || BasicStep;

		return (
			<div className="guided-tours">
				<StepComponent
					{ ...stepConfig }
					key={ stepConfig.target }
					targetSlug={ stepConfig.target }
					onNext={ this.next }
					onQuit={ this.quit }
					onFinish={ this.finish } />
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	tourState: getGuidedTourState( state ),
} ), {
	nextGuidedTourStep,
	quitGuidedTour,
	errorNotice,
} )( localize( GuidedTours ) );
