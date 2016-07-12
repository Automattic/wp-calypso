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
import config from 'config';
import sitesList from 'lib/sites-list';
import { plansLink, isSkipPlansTestEnabled } from 'lib/plans';
import Gridicon from 'components/gridicon';
import analytics from 'lib/analytics';

/**
 * Module variables
 */
const sites = sitesList();

export default React.createClass( {
	displayName: 'StepWrapper',

	renderBack: function() {
		return (
			<NavigationLink
				direction="back"
				flowName={ this.props.flowName }
				positionInFlow={ this.props.positionInFlow }
				stepName={ this.props.stepName }
				backUrl={ this.props.backUrl }
				signupProgressStore={ this.props.signupProgressStore } />
		);
	},

	renderSkip: function() {
		if ( this.props.goToNextStep ) {
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

	recordComparePlansClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	renderComparePlans() {
		const { stepName } = this.props;
		if ( stepName !== 'plans' || ! isSkipPlansTestEnabled() ) {
			return null;
		}

		const selectedSite = sites.getSelectedSite();
		const url = plansLink( '/start/plans/compare', selectedSite );
		const compareString = this.translate( 'Compare Plan Features' );

		return (
			<a href={ url } className="step-wrapper__compare-plans" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ compareString }
			</a>
		);
	},

	renderNavigation() {
		const { stepName } = this.props;
		const classes = classNames( 'step-wrapper__buttons', {
			'is-wide-navigation': stepName === 'plans' && isSkipPlansTestEnabled()
		} );
		return (
			<div className={ classes }>
				{ this.renderBack() }
				{ this.renderComparePlans() }
				{ this.renderSkip() }
			</div>
		);
	},

	render: function() {
		const { stepName, stepContent, headerButton } = this.props;
		const classes = classNames( 'step-wrapper', {
			'is-wide-layout': this.props.isWideLayout
		} );
		const showTopNavigation = stepName === 'plans' && isSkipPlansTestEnabled();

		return (
			<div className={ classes }>
				<StepHeader
					headerText={ this.headerText() }
					subHeaderText={ this.subHeaderText() }>
					{ config.isEnabled( 'jetpack/connect' )
						? ( headerButton )
						: null }
				</StepHeader>
				<div className="is-animated-content">
					{ showTopNavigation && this.renderNavigation() }
					{ stepContent }
					{ this.renderNavigation() }
				</div>
			</div>
		);
	}
} );
