/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compact, get, indexOf } from 'lodash';

/**
 * Internal dependencies
 */
import NavigationLink from './navigation-link';
import ProgressIndicator from './progress-indicator';

/**
 * Style dependencies
 */
import './style.scss';

class Wizard extends Component {
	static propTypes = {
		backText: PropTypes.string,
		basePath: PropTypes.string,
		baseSuffix: PropTypes.string,
		components: PropTypes.objectOf( PropTypes.element ).isRequired,
		forwardText: PropTypes.string,
		hideBackLink: PropTypes.bool,
		hideForwardLink: PropTypes.bool,
		hideNavigation: PropTypes.bool,
		onBackClick: PropTypes.func,
		onForwardClick: PropTypes.func,
		steps: PropTypes.arrayOf( PropTypes.string ).isRequired,
		stepName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		basePath: '',
		baseSuffix: '',
		hideBackLink: false,
		hideForwardLink: false,
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

	render() {
		const {
			backText,
			basePath,
			baseSuffix,
			components,
			forwardText,
			hideBackLink,
			hideForwardLink,
			hideNavigation,
			onBackClick,
			onForwardClick,
			steps,
			stepName,
			...otherProps
		} = this.props;
		const component = get( components, stepName );
		const stepIndex = this.getStepIndex();
		const totalSteps = steps.length;
		const backUrl = this.getBackUrl() || '';
		const forwardUrl = this.getForwardUrl() || '';

		return (
			<div className="wizard">
				{ totalSteps > 1 && (
					<ProgressIndicator stepNumber={ stepIndex } totalSteps={ totalSteps } />
				) }

				{ React.cloneElement( component, {
					basePath,
					getBackUrl: this.getBackUrl,
					getForwardUrl: this.getForwardUrl,
					steps,
					...otherProps,
				} ) }

				{ ! hideNavigation && totalSteps > 1 && (
					<div className="wizard__navigation-links">
						{ ! hideBackLink && stepIndex > 0 && (
							<NavigationLink
								direction="back"
								href={ backUrl }
								text={ backText }
								onClick={ onBackClick }
							/>
						) }

						{ ! hideForwardLink && stepIndex < totalSteps - 1 && (
							<NavigationLink
								direction="forward"
								href={ forwardUrl }
								text={ forwardText }
								onClick={ onForwardClick }
							/>
						) }
					</div>
				) }
			</div>
		);
	}
}

export default Wizard;
