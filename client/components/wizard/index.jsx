/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { compact, get, indexOf, omit } from 'lodash';

/**
 * Internal dependencies
 */
import NavigationLink from './navigation-link';
import ProgressIndicator from 'components/wizard/progress-indicator';

class Wizard extends Component {
	static propTypes = {
		animateTransitions: PropTypes.bool,
		backText: PropTypes.string,
		basePath: PropTypes.string,
		baseSuffix: PropTypes.string,
		components: PropTypes.objectOf( PropTypes.element ).isRequired,
		forwardText: PropTypes.string,
		hideNavigation: PropTypes.bool,
		steps: PropTypes.arrayOf( PropTypes.string ).isRequired,
		stepName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		animateTransitions: true,
		basePath: '',
		baseSuffix: '',
		hideNavigation: false,
	};

	getStepIndex = () => indexOf( this.props.steps, this.props.stepName );

	getBackUrl = () => {
		const stepIndex = this.getStepIndex();

		if ( stepIndex < 1 ) {
			return;
		}

		const { basePath, baseSuffix, steps } = this.props;
		const previousStepName = steps[ stepIndex - 1 ];

		if ( ! previousStepName ) {
			return;
		}

		return compact( [ basePath, previousStepName, baseSuffix ] ).join( '/' );
	};

	getForwardUrl = () => {
		const { basePath, baseSuffix, steps } = this.props;
		const stepIndex = this.getStepIndex();

		if ( stepIndex === -1 || stepIndex === steps.length - 1 ) {
			return;
		}

		const nextStepName = steps[ stepIndex + 1 ];

		if ( ! nextStepName ) {
			return;
		}

		return compact( [ basePath, nextStepName, baseSuffix ] ).join( '/' );
	};

	contentToRender = () => {
		const { animateTransitions, components, stepName, ...otherProps } = this.props;
		const component = get( components, stepName );

		return animateTransitions ? (
			<ReactCSSTransitionGroup
				className="wizard__transitions"
				transitionName="wizard__transition"
				transitionEnterTimeout={ 200 }
				transitionLeaveTimeout={ 300 }
			>
				{ React.cloneElement( component, {
					getBackUrl: this.getBackUrl,
					getForwardUrl: this.getForwardUrl,
					...omit( otherProps, [ 'basePath', 'baseSuffix' ] ),
				} ) }
			</ReactCSSTransitionGroup>
		) : (
			React.cloneElement( component, {
				getBackUrl: this.getBackUrl,
				getForwardUrl: this.getForwardUrl,
				...omit( otherProps, [ 'basePath', 'baseSuffix' ] ),
			} )
		);
	};

	render() {
		const { steps, backText, forwardText, hideNavigation } = this.props;
		const stepIndex = this.getStepIndex();
		const totalSteps = steps.length;
		const backUrl = this.getBackUrl() || '';
		const forwardUrl = this.getForwardUrl() || '';

		return (
			<div className="wizard">
				{ totalSteps > 1 && (
					<ProgressIndicator stepNumber={ stepIndex } totalSteps={ totalSteps } />
				) }

				{ this.contentToRender() }

				{ ! hideNavigation &&
					totalSteps > 1 && (
						<div className="wizard__navigation-links">
							{ stepIndex > 0 && (
								<NavigationLink direction="back" href={ backUrl } text={ backText } />
							) }

							{ stepIndex < totalSteps - 1 && (
								<NavigationLink direction="forward" href={ forwardUrl } text={ forwardText } />
							) }
						</div>
					) }
			</div>
		);
	}
}

export default Wizard;
