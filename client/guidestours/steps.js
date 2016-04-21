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
import { posToCss, getStepPosition, getBullseyePosition, targetForSlug } from './positioning';

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
			<Card className="guidestours__step guidestours__step-first" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( "Let's do it!" ) }</Button>
					<Button onClick={ onQuit } >
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

		const { text, onFinish, linkUrl, linkLabel } = this.props;

		return (
			<Card className="guidestours__step" style={ stepCoords } >
				<p>{ text }</p>
				<div className="guidestours__single-button-row">
					<Button onClick={ onFinish } primary>{ this.props.translate( 'Finish Tour' ) }</Button>
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
		const { targetSlug = false, onNext } = this.props;
		const target = targetForSlug( targetSlug );

		if ( onNext && target.addEventListener ) {
			target.addEventListener( 'click', onNext );
		}
		target && target.classList.add( 'guidestours__overlay' );
	}

	removeTargetListener() {
		const { targetSlug = false, onNext } = this.props;
		const target = targetForSlug( targetSlug );

		if ( onNext && target.removeEventListener ) {
			target.removeEventListener( 'click', onNext );
		}
		target && target.classList.remove( 'guidestours__overlay' );
	}

	render() {
		const stepPos = getStepPosition( this.props );
		const bullseyePos = getBullseyePosition( this.props );
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

GuidesActionStep.propTypes = {
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

GuidesLinkStep.propTypes = {
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

GuidesFirstStep.propTypes = {
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

GuidesFinishStep.propTypes = {
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

