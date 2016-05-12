/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import localize from 'lib/mixins/i18n/localize';
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import Gridicon from 'components/gridicon';
import {
	query,
	posToCss,
	getStepPosition,
	getBullseyePosition,
	getOverlayStyle,
	targetForSlug,
	getScrolledRectFromBase,
} from './positioning';

class BasicStep extends Component {
	render() {
		if ( ! this.props.stepPosition ) {
			return null;
		}

		const { text, onNext, onQuit } = this.props;
		return (
			<Card className="guided-tours__step" style={ this.props.stepPosition } >
				<p>{ text }</p>
				<div className="guided-tours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( 'Continue' ) }</Button>
					<Button onClick={ onQuit } borderless>{ this.props.translate( 'Do this later' ) }</Button>
				</div>
			</Card>
		);
	}
}

class FirstStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onNext, onQuit } = this.props;
		return (
			<Card className="guided-tours__step guided-tours__step-first" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guided-tours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( "Let's do it!" ) }</Button>
					<Button onClick={ onQuit } >
						{ this.props.translate( 'No, thanks' ) }
					</Button>
				</div>
			</Card>
		);
	}
}

class FinishStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onFinish, linkUrl, linkLabel } = this.props;

		return (
			<Card className="guided-tours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guided-tours__single-button-row">
					<Button onClick={ onFinish } primary>{ this.props.translate( "We're all done!" ) }</Button>
				</div>
				<div className="guided-tours__external-link">
					<ExternalLink target="_blank" icon={ true } href={ linkUrl }>{ linkLabel }</ExternalLink>
				</div>
			</Card>
		);
	}
}

class LinkStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onNext, onQuit, linkUrl, linkLabel } = this.props;

		return (
			<Card className="guided-tours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guided-tours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( 'Continue' ) }</Button>
					<Button onClick={ onQuit } borderless>{ this.props.translate( 'Do this later' ) }</Button>
				</div>
				<div className="guided-tours__external-link">
					<ExternalLink target="_blank" icon={ true } href={ linkUrl }>{ linkLabel }</ExternalLink>
				</div>
			</Card>
		);
	}
}

class ActionStep extends Component {
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
		const { targetSlug = false, onNext } = this.props;
		const target = targetForSlug( targetSlug );

		if ( onNext && target.addEventListener ) {
			target.addEventListener( 'click', onNext );
		}
	}

	removeTargetListener() {
		const { targetSlug = false, onNext } = this.props;
		const target = targetForSlug( targetSlug );

		if ( onNext && target.removeEventListener ) {
			target.removeEventListener( 'click', onNext );
		}
	}

	render() {
		if ( ! this.props.stepPosition ) {
			return null;
		}

		const { text } = this.props;

		const bullseyePos = getBullseyePosition( this.props );
		const pointerCoords = posToCss( bullseyePos );

		return (
			<Card className="guided-tours__step" style={ this.props.stepPosition } >
				<p>{ text }</p>
				<div className="guided-tours__bullseye-instructions">
					<p>
						{ this.props.translate( 'Click the {{gridicon/}} to continue…', {
							components: {
								gridicon: <Gridicon icon={ this.props.icon } size={ 24 } />
							}
						} ) }
					</p>
				</div>
			<Pointer style={ pointerCoords } />
			</Card>
		);
	}
}

const withHighlighting = StepComponent => class extends Component {
	componentWillMount() {
		const sidebar = query( '#secondary .sidebar' )[ 0 ];
		this.computedProps = {
			stepPosition: posToCss( getStepPosition( this.props ) ),
			targetRect: getScrolledRectFromBase( this.props.targetSlug, sidebar ),
		};
	}

	render() {
		const { stepPosition, targetRect } = this.computedProps;
		return (
			<div>
				<Overlay { ...{ targetRect } } />
				<StepComponent { ...this.props } { ...{ stepPosition } } />
			</div>
		);
	}
};

BasicStep.propTypes = {
	targetSlug: PropTypes.string,
	placement: PropTypes.string,
	// text can be a translated string or a translated string with components
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	next: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	onQuit: PropTypes.func.isRequired,
};

ActionStep.propTypes = {
	targetSlug: PropTypes.string.isRequired,
	placement: PropTypes.string,
	// text can be a translated string or a translated string with components
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	next: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	onQuit: PropTypes.func.isRequired,
};

LinkStep.propTypes = {
	targetSlug: PropTypes.string,
	placement: PropTypes.string,
	// text can be a translated string or a translated string with components
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	linkLabel: PropTypes.string,
	linkUrl: PropTypes.string,
	next: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	onQuit: PropTypes.func.isRequired,
};

FirstStep.propTypes = {
	targetSlug: PropTypes.string,
	placement: PropTypes.string,
	// text can be a translated string or a translated string with components
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	next: PropTypes.string,
	onNext: PropTypes.func.isRequired,
	onQuit: PropTypes.func.isRequired,
};

FinishStep.propTypes = {
	targetSlug: PropTypes.string,
	placement: PropTypes.string,
	// text can be a translated string or a translated string with components
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	linkLabel: PropTypes.string,
	linkUrl: PropTypes.string,
	onFinish: PropTypes.func.isRequired,
};

class Pointer extends Component {
	render() {
		return (
			<div className="guided-tours__bullseye" style={ this.props.style }>
				<div className="guided-tours__bullseye-ring" />
				<div className="guided-tours__bullseye-center" />
			</div>
		);
	}
}

Pointer.propTypes = {
	style: PropTypes.object.isRequired,
};

class Overlay extends Component {
	render() {
		const { targetRect } = this.props;
		const overlayStyle = getOverlayStyle( { rect: targetRect } );

		return (
			<div className="guided-tours__overlay-container">
				<div className="guided-tours__overlay" style={ overlayStyle.top } />
				<div className="guided-tours__overlay" style={ overlayStyle.left } />
				<div className="guided-tours__overlay" style={ overlayStyle.right } />
				<div className="guided-tours__overlay" style={ overlayStyle.bottom } />
			</div>
		);
	}
}

Overlay.propTypes = {
	targetRect: PropTypes.object.isRequired,
};

export default {
	BasicStep: localize( withHighlighting( BasicStep ) ),
	LinkStep: localize( LinkStep ),
	ActionStep: localize( withHighlighting( ActionStep ) ),
	FirstStep: localize( FirstStep ),
	FinishStep: localize( FinishStep ),
};
