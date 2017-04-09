/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StepHeader from 'signup/step-header';
import NavigationLink from 'signup/navigation-link';
import { abtest } from 'lib/abtest';

export default React.createClass( {
	displayName: 'StepWrapper',

	propTypes: {
		shouldHideNavButtons: React.PropTypes.bool
	},

	renderBack: function() {
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
	},

	renderSkip: function() {
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
	},

	headerText: function() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.headerText ) {
				return this.props.headerText;
			}
			return this.translate( 'Let\'s get started.' );
		}

		if ( this.props.fallbackHeaderText ) {
			return this.props.fallbackHeaderText;
		}
	},

	subHeaderText: function() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.subHeaderText ) {
				return this.props.subHeaderText;
			}
			return this.translate( 'Welcome to the best place for your WordPress website.' );
		}

		if ( this.props.fallbackSubHeaderText ) {
			return this.props.fallbackSubHeaderText;
		}
	},

	render: function() {
		const { stepContent, headerButton } = this.props;
		const classes = classNames( 'step-wrapper', {
			'is-wide-layout': this.props.isWideLayout,
			'step-wrapper--mobile-test': abtest( 'signupStepOneMobileOptimize' ) === 'modified',
		} );

		return (
			<div className={ classes }>
				<StepHeader
					headerText={ this.headerText() }
					subHeaderText={ this.subHeaderText() }>
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
} );
