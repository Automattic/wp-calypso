/**
 * External dependencies
 */
import { get, indexOf } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import NavigationLink from './navigation-link';
import ProgressIndicator from 'components/wizard/progress-indicator';

class Wizard extends Component {
	static propTypes = {
		backText: PropTypes.string,
		basePath: PropTypes.string,
		components: PropTypes.objectOf( PropTypes.element ).isRequired,
		forwardText: PropTypes.string,
		hideNavigation: PropTypes.bool,
		steps: PropTypes.arrayOf( PropTypes.string ).isRequired,
		stepName: PropTypes.string.isRequired,
	}

	static defaultProps = {
		basePath: '',
		hideNavigation: false,
	}

	getStepIndex = () => indexOf( this.props.steps, this.props.stepName );

	getBackUrl = () => {
		const stepIndex = this.getStepIndex();

		if ( stepIndex < 1 ) {
			return;
		}

		const { basePath, steps } = this.props;
		const previousStepName = steps[ stepIndex - 1 ];

		if ( ! previousStepName ) {
			return;
		}

		return `${ basePath }/${ previousStepName }`;
	}

	getForwardUrl = () => {
		const { basePath, steps } = this.props;
		const stepIndex = this.getStepIndex();

		if ( stepIndex === -1 || ( stepIndex === steps.length - 1 ) ) {
			return;
		}

		const nextStepName = steps[ stepIndex + 1 ];

		if ( ! nextStepName ) {
			return;
		}

		return `${ basePath }/${ nextStepName }`;
	}

	render() {
		const {
			backText,
			components,
			forwardText,
			hideNavigation,
			steps,
			stepName,
		} = this.props;
		const component = get( components, stepName );
		const stepIndex = this.getStepIndex();
		const totalSteps = steps.length;
		const backUrl = this.getBackUrl() || '';
		const forwardUrl = this.getForwardUrl() || '';

		return (
			<div className="wizard">
				{ totalSteps > 1 &&
					<ProgressIndicator
						stepNumber={ stepIndex }
						totalSteps={ totalSteps } />
				}

				{ component }

				{ ! hideNavigation && totalSteps > 1 &&
					<div className="wizard__navigation-links">
						{ stepIndex > 0 &&
							<NavigationLink
								direction="back"
								href={ backUrl }
								text={ backText } />
						}

						{ stepIndex < totalSteps - 1 &&
							<NavigationLink
								direction="forward"
								href={ forwardUrl }
								text={ forwardText } />
						}
					</div>
				}
			</div>
		);
	}
}

export default Wizard;
