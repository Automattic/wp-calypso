/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import NavigationLink from 'signup/navigation-link';
import SiteMockups from 'signup/site-mockup';

/**
 * Style dependencies
 */
import './style.scss';

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

	render() {
		const {
			stepContent,
			headerButton,
			hideFormattedHeader,
			hideBack,
			hideSkip,
			showSiteMockups,
		} = this.props;
		const classes = classNames( 'step-wrapper', this.props.className, {
			'is-wide-layout': this.props.isWideLayout,
		} );

		return (
			<>
				<div className={ classes }>
					{ ! hideFormattedHeader && (
						<FormattedHeader
							id={ 'step-header' }
							headerText={ this.headerText() }
							subHeaderText={ this.subHeaderText() }
						>
							{ headerButton }
						</FormattedHeader>
					) }

					<div className="step-wrapper__content">{ stepContent }</div>

					<div className="step-wrapper__buttons">
						{ ! hideBack && this.renderBack() }
						{ ! hideSkip && this.renderSkip() }
					</div>
				</div>
{/*
				{ showSiteMockups && <SiteMockups /> }
*/}
			</>
		);
	}
}

export default localize( StepWrapper );
