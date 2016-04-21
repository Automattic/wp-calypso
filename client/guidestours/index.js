/**
 * External dependencies
 */
import React, { Component } from 'react'
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite, getGuidesTourState } from 'state/ui/selectors';
import { nextGuidesTourStep } from 'state/ui/actions';
import { query } from './positioning';
import {
	GuidesBasicStep,
	GuidesFirstStep,
	GuidesLinkStep,
	GuidesFinishStep,
	GuidesActionStep,
} from './steps';

class GuidesTours extends Component {
	constructor() {
		super();
		this.bind( 'next', 'quit' );
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
		this.props.nextGuidesTourStep( nextStepName );
	}

	quit() {
		this.currentTarget && this.currentTarget.classList.remove( 'guidestours__overlay' );
		this.props.nextGuidesTourStep( null );
	}

	render() {
		const { stepConfig } = this.props.tourState;

		if ( ! stepConfig ) {
			return null;
		}

		const StepComponent = {
			GuidesFirstStep,
			GuidesActionStep,
			GuidesLinkStep,
			GuidesFinishStep,
		}[ stepConfig.type ] || GuidesBasicStep;

		return (
			<div className="guidestours">
				<StepComponent
					{ ...stepConfig }
					key={ stepConfig.target }
					target={ this.currentTarget }
					onNext={ this.next }
					onQuit={ this.quit } />
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	selectedSite: getSelectedSite( state ),
	tourState: getGuidesTourState( state ),
} ), {
	nextGuidesTourStep,
} )( GuidesTours );
