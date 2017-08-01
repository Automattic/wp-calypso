/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { get, indexOf } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import NavigationLink from './navigation-link';
import ProgressIndicator from 'components/wizard/progress-indicator';

class Wizard extends Component {
	static propTypes = {
		basePath: PropTypes.string,
		components: PropTypes.objectOf( PropTypes.element ).isRequired,
		steps: PropTypes.arrayOf( PropTypes.string ).isRequired,
		stepName: PropTypes.string.isRequired,
	}

	static defaultProps = {
		basePath: '',
	}

	getStepIndex = () => indexOf( this.props.steps, this.props.stepName );

	goBack = () => {
		const stepIndex = this.getStepIndex();

		if ( stepIndex < 1 ) {
			return;
		}

		const { basePath, steps } = this.props;
		const previousStepName = steps[ stepIndex - 1 ];

		if ( ! previousStepName ) {
			return;
		}

		page( `${ basePath }/${ previousStepName }` );
	}

	skip = () => {
		const { basePath, steps } = this.props;
		const stepIndex = this.getStepIndex();

		if ( stepIndex === -1 || ( stepIndex === steps.length - 1 ) ) {
			return;
		}

		const nextStepName = steps[ stepIndex + 1 ];

		if ( ! nextStepName ) {
			return;
		}

		page( `${ basePath }/${ nextStepName }` );
	}

	render() {
		const { components, steps, stepName } = this.props;
		const component = get( components, stepName );
		const stepIndex = this.getStepIndex();
		const totalSteps = steps.length;

		return (
			<div className="wizard">
				{ totalSteps > 1 &&
					<ProgressIndicator
						stepNumber={ stepIndex }
						totalSteps={ totalSteps } />
				}

				{ component }

				{ totalSteps > 1 &&
					<div className="wizard__navigation-links">
						{ stepIndex > 0 &&
							<NavigationLink
								direction="back"
								onClick={ this.goBack } />
						}

						{ stepIndex < totalSteps - 1 &&
							<NavigationLink
								direction="forward"
								onClick={ this.skip } />
						}
					</div>
				}
			</div>
		);
	}
}

export default Wizard;
