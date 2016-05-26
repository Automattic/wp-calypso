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

class BasicStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );

		const { text, onNext, onQuit } = this.props;
		return (
			<Card className="guided-tours__step" style={ stepCoords } >
				<p className="guided-tours__step-text">{ text }</p>
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
				<p className="guided-tours__step-text">{ text }</p>
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
				<p className="guided-tours__step-text">{ text }</p>
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
				<p className="guided-tours__step-text">{ text }</p>
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

		if ( onNext && target && target.addEventListener ) {
			target.addEventListener( 'click', onNext );
		}
	}

	removeTargetListener() {
		const { targetSlug = false, onNext } = this.props;
		const target = targetForSlug( targetSlug );

		if ( onNext && target && target.removeEventListener ) {
			target.removeEventListener( 'click', onNext );
		}
	}

	render() {
		const stepPos = getStepPosition( this.props );
		const bullseyePos = getBullseyePosition( this.props );
		const stepCoords = posToCss( stepPos );
		const pointerCoords = posToCss( bullseyePos );

		const { text } = this.props;

		let components = {};
		if ( this.props.icon ) {
			components.gridicon = <Gridicon icon={ this.props.icon } size={ 24 } />
		} else {
			components.gridicon = <span className="guided-tours__bullseye-text">○</span>
		}

		return (
			<Card className="guided-tours__step" style={ stepCoords } >
				<p className="guided-tours__step-text">{ text }</p>
				<p className="guided-tours__bullseye-instructions">
					{ this.props.translate( 'Click the {{gridicon/}} to continue.', {
						components: components
					} ) }
				</p>
				<Pointer style={ pointerCoords } />
			</Card>
		);
	}
}

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
	icon: PropTypes.string,
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

export default {
	BasicStep: localize( BasicStep ),
	LinkStep: localize( LinkStep ),
	ActionStep: localize( ActionStep ),
	FirstStep: localize( FirstStep ),
	FinishStep: localize( FinishStep ),
};
