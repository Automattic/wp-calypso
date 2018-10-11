/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { indexOf } from 'lodash';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import NavigationLink from 'signup/navigation-link';
import FlowProgressIndicator from 'signup/flow-progress-indicator';
import flows from 'signup/config/flows';

class StepWrapper extends Component {
	static propTypes = {
		shouldHideNavButtons: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		hideFormattedHeader: PropTypes.bool,
		hideBack: PropTypes.bool,
		hideSkip: PropTypes.bool,
		// Allows to force a back button in the first step for example.
		// You should only force this when you're passing a backUrl.
		allowBackFirstStep: PropTypes.bool,
	};

	static defaultProps = {
		allowBackFirstStep: false,
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
				signupProgress={ this.props.signupProgress }
				labelText={ this.props.backLabelText }
				allowBackFirstStep={ this.props.allowBackFirstStep }
			/>
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
					stepName={ this.props.stepName }
					labelText={ this.props.skipLabelText }
				/>
			);
		}
	}

	headerText() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.headerText !== undefined ) {
				return this.props.headerText;
			}

			return this.props.translate( "Let's get started." );
		}

		if ( this.props.fallbackHeaderText !== undefined ) {
			return this.props.fallbackHeaderText;
		}
	}

	subHeaderText() {
		if ( this.props.positionInFlow === 0 ) {
			if ( this.props.subHeaderText !== undefined ) {
				return this.props.subHeaderText;
			}

			return this.props.translate( 'Welcome to the best place for your WordPress website.' );
		}

		if ( this.props.fallbackSubHeaderText !== undefined ) {
			return this.props.fallbackSubHeaderText;
		}
	}

	testimonial() {
		const { translate } = this.props;

		return (
			<div className="step-wrapper__testimonial">
				<div className="step-wrapper__testimonial-image">
					<img src="/calypso/images/signup/debperlman.jpg" alt="" />
				</div>
				<div className="step-wrapper__testimonial-content">
					{ translate(
						'“I love having a place where I can share what I’m working on in an immediate way and have a conversation with people who are equally excited about it.”'
					) }
				</div>
				<div className="step-wrapper__testimonial-author">
					{ translate(
						'{{spanName}}Deb Perlman{{/spanName}}, {{spanSite}}smittenkitchen.com{{/spanSite}}',
						{
							components: {
								spanName: <span className="step-wrapper__testimonial-name" />,
								spanSite: <span className="step-wrapper__testimonial-site" />,
							},
							comment: 'Customer name with comma, followed by domain name',
						}
					) }
				</div>
			</div>
		);
	}

	getPositionInFlow( fakedForTwoPartFlows = false ) {
		let position = indexOf( flows.getFlow( this.props.flowName ).steps, this.props.stepName );
		if ( fakedForTwoPartFlows && this.props.flowName === 'user-continue' ) {
			position++;
		}
		return position;
	}

	getFlowLength() {
		// fake it for our two-step flow
		if ( [ 'user-first', 'user-continue' ].includes( this.props.flowName ) ) {
			return 4;
		}
		return flows.getFlow( this.props.flowName ).steps.length;
	}

	render() {
		const {
			stepContent,
			headerButton,
			hideFormattedHeader,
			hideBack,
			hideSkip,
			stepName,
		} = this.props;
		const classes = classNames( 'step-wrapper', this.props.className, {
			'is-wide-layout': this.props.isWideLayout,
		} );
		const showProgressIndicator = 'pressable-nux' === this.props.flowName ? false : true;

		return (
			<div className={ classes }>
				{ showProgressIndicator && (
					<FlowProgressIndicator
						positionInFlow={ this.getPositionInFlow( true ) }
						flowLength={ this.getFlowLength() }
						flowName={ this.props.flowName }
					/>
				) }
				{ ! hideFormattedHeader && (
					<FormattedHeader
						id={ 'step-header' }
						headerText={ this.headerText() }
						subHeaderText={ this.subHeaderText() }
					>
						{ headerButton }
					</FormattedHeader>
				) }

				<div className="step-wrapper__content is-animated-content">
					{ stepContent }

					<div className="step-wrapper__buttons">
						{ ! hideBack && this.renderBack() }
						{ ! hideSkip && this.renderSkip() }
					</div>
				</div>

				{ 'domains' === stepName || 'rebrand-cities-welcome' === stepName
					? null
					: this.testimonial() }
			</div>
		);
	}
}

export default localize( StepWrapper );
