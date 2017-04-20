/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StepHeader from 'signup/step-header';
import NavigationLink from 'signup/navigation-link';

class StepWrapper extends Component {
	static propTypes = {
		shouldHideNavButtons: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	renderBack() {
		if ( this.props.shouldHideNavButtons ) {
			return null;
		}
		return (
			<NavigationLink
				direction="back"
				flowName={ this.props.flowName }
				positionInFlow={ this.props.positionInFlow }
				stepName={ this.props.stepName }
				stepSectionName={ this.props.stepSectionName }
				backUrl={ this.props.backUrl }
				signupProgress={ this.props.signupProgress } />
		);
	}

	renderSkip() {
		if ( ! this.props.shouldHideNavButtons && this.props.goToNextStep ) {
			return (
				<NavigationLink
					direction="forward"
					goToNextStep={ this.props.goToNextStep }
					defaultDependencies={ this.props.defaultDependencies }
					flowName={ this.props.flowName }
					stepName={ this.props.stepName } />
			);
		}
	}

	headerText() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.headerText ) {
				return this.props.headerText;
			}
			return this.props.translate( 'Create your account.' );
		}

		if ( this.props.fallbackHeaderText ) {
			return this.props.fallbackHeaderText;
		}
	}

	render() {
		const { stepContent, headerButton } = this.props;
		const classes = classNames( 'step-wrapper', {
			'is-wide-layout': this.props.isWideLayout,
		} );

		return (
			<div className={ classes }>
				<StepHeader
					headerText={ this.headerText() }>
					{ ( headerButton ) }
				</StepHeader>
				<div className="step-wrapper__content is-animated-content">
					{ stepContent }
					<div className="step-wrapper__buttons">
						{ this.renderBack() }
						{ this.renderSkip() }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( StepWrapper );
