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
			return this.translate( 'Create your account.' );
		}

		if ( this.props.fallbackHeaderText ) {
			return this.props.fallbackHeaderText;
		}
	},

	render: function() {
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
} );
