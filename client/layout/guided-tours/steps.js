/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import Gridicon from 'components/gridicon';
import { posToCss, getStepPosition, getValidatedArrowPosition, targetForSlug } from './positioning';

class BasicStep extends Component {
	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );
		const { text, onNext, onQuit, targetSlug, arrow } = this.props;

		const classes = [
			'guided-tours__step',
			'guided-tours__step-glow',
			targetSlug && 'guided-tours__step-pointing',
			targetSlug && 'guided-tours__step-pointing-' + getValidatedArrowPosition( {
				targetSlug,
				arrow,
				stepPos
			} ),
		].filter( Boolean );

		return (
			<Card className={ classNames( ...classes ) } style={ stepCoords } >
				<p className="guided-tours__step-text">{ text }</p>
				<div className="guided-tours__choice-button-row">
					<Button onClick={ onNext } primary>{ this.props.translate( 'Next' ) }</Button>
					<Button onClick={ onQuit } borderless>{ this.props.translate( 'Exit tour' ) }</Button>
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
		// let the CSS override top
		stepCoords.top = undefined;

		const { text, onFinish, linkUrl, linkLabel } = this.props;

		return (
			<Card className="guided-tours__step guided-tours__step-finish guided-tours__step-glow" style={ stepCoords } >
				<p className="guided-tours__step-text">{ text }</p>
				<div className="guided-tours__single-button-row">
					<Button onClick={ onFinish } primary>{ this.props.translate( "We're all done!" ) }</Button>
				</div>
				{
					linkUrl && linkLabel &&
						<div className="guided-tours__external-link">
							<ExternalLink target="_blank" icon={ true } href={ linkUrl }>{ linkLabel }</ExternalLink>
						</div>
				}
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
					<Button onClick={ onNext } primary>{ this.props.translate( 'Next' ) }</Button>
					<Button onClick={ onQuit } borderless>{ this.props.translate( 'Exit tour' ) }</Button>
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
		const { targetSlug = false, onNext, continueIf } = this.props;
		const target = targetForSlug( targetSlug );

		if ( ! continueIf && onNext && target && target.addEventListener ) {
			target.addEventListener( 'click', onNext );
			target.addEventListener( 'touchstart', onNext );
		}
	}

	removeTargetListener() {
		const { targetSlug = false, onNext, continueIf } = this.props;
		const target = targetForSlug( targetSlug );

		if ( ! continueIf && onNext && target && target.removeEventListener ) {
			target.removeEventListener( 'click', onNext );
			target.removeEventListener( 'touchstart', onNext );
		}
	}

	render() {
		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );
		const { text, targetSlug, arrow } = this.props;

		let instructions;

		if ( this.props.icon ) {
			instructions = this.props.translate( 'Click the {{GridIcon/}} to continue.', {
				components: {
					GridIcon: <Gridicon icon={ this.props.icon } size={ 24 } />,
				},
			} );
		} else if ( this.props.iconText ) {
			instructions = this.props.translate( 'Click {{iconText/}} to continue.', {
				components: {
					iconText: <strong>{ this.props.iconText }</strong>,
				},
			} );
		} else if ( ! this.props.continueIf ) {
			instructions = this.props.translate( 'Click to continue.' );
		} else {
			instructions = null;
		}

		const classes = [
			'guided-tours__step',
			'guided-tours__step-action',
			'guided-tours__step-glow',
			'guided-tours__step-pointing',
			'guided-tours__step-pointing-' + getValidatedArrowPosition( {
				targetSlug,
				arrow,
				stepPos
			} ),
		].filter( Boolean );

		return (
			<Card className={ classNames( ...classes ) } style={ stepCoords } >
				<p className="guided-tours__step-text">{ text }</p>
				<p className="guided-tours__actionstep-instructions">
					{ instructions }
				</p>
			</Card>
		);
	}
}

const ARROW_TYPES = [
	'none',
	'top-left',
	'top-center',
	'top-right',
	'right-top',
	'right-middle',
	'right-bottom',
	'bottom-right',
	'bottom-center',
	'bottom-left',
	'left-bottom',
	'left-middle',
	'left-top',
];

BasicStep.propTypes = {
	targetSlug: PropTypes.string,
	arrow: PropTypes.oneOf( ARROW_TYPES ),
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
	targetSlug: PropTypes.string,
	arrow: PropTypes.oneOf( ARROW_TYPES ),
	placement: PropTypes.string,
	// text can be a translated string or a translated string with components
	text: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array
	] ),
	icon: PropTypes.string,
	iconText: PropTypes.string,
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

export default {
	BasicStep: localize( BasicStep ),
	LinkStep: localize( LinkStep ),
	ActionStep: localize( ActionStep ),
	FirstStep: localize( FirstStep ),
	FinishStep: localize( FinishStep ),
};
