/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react'

/**
 * Internal dependencies
 */
import localize from 'lib/mixins/i18n/localize';
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import Gridicon from 'components/gridicon';
import { posToCss, bullseyePositioners, getStepPosition } from './positioning';

class GuidesBasicStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onNext, onQuit } = this.props;
		return (
			<Card className="guidestours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( 'Continue' ) }</Button>
					<Button onClick={ onQuit } borderless>{ this.props.translate( 'Do this later.' ) }</Button>
				</div>
			</Card>
		);
	}
}

class GuidesFirstStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onNext, onQuit } = this.props;
		return (
			<Card className="guidestours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( 'Continue' ) }</Button>
					<Button onClick={ onQuit } className="guidestours__secondary-button">
						{ this.props.translate( 'No, thanks.' ) }
					</Button>
				</div>
			</Card>
		);
	}
}

class GuidesFinishStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onQuit, linkUrl, linkLabel } = this.props;

		return (
			<Card className="guidestours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__single-button-row">
					<Button onClick={ onQuit } primary>{ this.props.translate( 'Finish Tour' ) }</Button>
				</div>
				<div className="guidestours__external-link">
					<ExternalLink target="_blank" icon={ true } href={ linkUrl }>{ linkLabel }</ExternalLink>
				</div>
			</Card>
		);
	}
}

class GuidesLinkStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onNext, onQuit, linkUrl, linkLabel } = this.props;

		return (
			<Card className="guidestours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( 'Continue' ) }</Button>
					<Button onClick={ onQuit } borderless>{ this.props.translate( 'Do this later.' ) }</Button>
				</div>
				<div className="guidestours__external-link">
					<ExternalLink target="_blank" icon={ true } href={ linkUrl }>{ linkLabel }</ExternalLink>
				</div>
			</Card>
		);
	}
}

class GuidesActionStep extends Component {
	componentDidMount() {
		this.addTargetListener();
	}

	componentWillUnmount() {
		this.removeTargetListener();
	}

	componentWillUpdate() {
		this.removeTargetListener();
	}

	componentDidUpdate() {
		this.addTargetListener();
	}

	addTargetListener() {
		const { target = false, onNext } = this.props;
		if ( onNext && target.addEventListener ) {
			target.addEventListener( 'click', onNext );
		}
		target && target.classList.add( 'guidestours__overlay' );
	}

	removeTargetListener() {
		const { target = false, onNext } = this.props;
		if ( onNext && target.removeEventListener ) {
			target.removeEventListener( 'click', onNext );
		}
		target && target.classList.remove( 'guidestours__overlay' );
	}

	getBullseyePosition() {
		const { placement = 'center', target } = this.props;
		const rect = target
			? target.getBoundingClientRect()
			: global.window.document.body.getBoundingClientRect();

		return bullseyePositioners[ placement ]( rect );
	}

	render() {
		const stepPos = getStepPosition( this.props );
		const bullseyePos = this.getBullseyePosition();
		const stepCoords = posToCss( stepPos );
		const pointerCoords = posToCss( bullseyePos );

		const { text } = this.props;

		return (
			<Card className="guidestours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__bullseye-instructions">
					<p>
						{ this.props.translate( 'Click the {{gridicon/}} to continue…', {
							components: {
								gridicon: <Gridicon icon={ this.props.icon } size={ 24 } />
							}
						} ) }
					</p>
				</div>
				<GuidesPointer style={ pointerCoords } />
			</Card>
		);
	}
}

GuidesBasicStep.propTypes = {
	target: PropTypes.object,
	type: PropTypes.string,
	// text can be a translated string or a translated string with components
	// attached
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	placement: PropTypes.string,
	next: PropTypes.string,
	style: PropTypes.object,
	onNext: PropTypes.func.isRequired,
	onQuit: PropTypes.func.isRequired,
};

class GuidesPointer extends Component {
	render() {
		return (
			<div className="guidestours__bullseye" style={ this.props.style }>
				<div className="guidestours__bullseye-ring" />
				<div className="guidestours__bullseye-center" />
			</div>
		);
	}
}

GuidesPointer.propTypes = {
	style: PropTypes.object.isRequired,
};

export default {
	GuidesBasicStep: localize( GuidesBasicStep ),
	GuidesLinkStep: localize( GuidesLinkStep ),
	GuidesActionStep: localize( GuidesActionStep ),
	GuidesFirstStep: localize( GuidesFirstStep ),
	GuidesFinishStep: localize( GuidesFinishStep ),
}

