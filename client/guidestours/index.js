/**
 * External dependencies
 */
import React, { Component } from 'react'

/**
 * Internal dependencies
 */
import guideConfig from './config';
import { query } from './positioning';
import {
	GuidesBasicStep,
	GuidesFirstStep,
	GuidesLinkStep,
	GuidesFinishStep,
	GuidesActionStep,
} from './steps';

export default class GuidesTours extends Component {
	constructor() {
		super();
		this.bind( 'next', 'quit' );
		this.state = { currentStep: guideConfig.init };
	}

	bind( ...methods ) {
		methods.forEach( m => this[ m ] = this[ m ].bind( this ) );
	}

	componentDidMount() {
		this.tipTargets = this.getTipTargets();
		this.updateTarget( this.state.currentStep );
	}

	componentWillUpdate( nextProps, nextState ) {
		this.updateTarget( nextState.currentStep );
	}

	updateTarget( step ) {
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
		this.setState( { currentStep: guideConfig[ this.state.currentStep.next ] } );
	}

	quit() {
		//TODO: should we dispatch a showGuidesTour action here instead?
		this.currentTarget && this.currentTarget.classList.remove( 'guidestours__overlay' );
		this.setState( { currentStep: null } );
	}

	render() {
		if ( ! this.state.currentStep ) {
			return null;
		}

		const StepComponent = {
			GuidesFirstStep,
			GuidesActionStep,
			GuidesLinkStep,
			GuidesFinishStep,
		}[ this.state.currentStep.type ] || GuidesBasicStep;

		return (
			<div>
				<StepComponent
					{ ...this.state.currentStep }
					key={ this.state.target }
					target={ this.currentTarget }
					onNext={ this.next }
					onQuit={ this.quit } />
			</div>
		);
	}
}
