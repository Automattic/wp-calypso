/**
 * External dependencies
 */
import { Gridicon, Button } from '@automattic/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';

import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { hideOnboardingWelcomePrompt } from 'state/inline-help/actions';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ChecklistOnboardingWelcome extends Component {
	static propTypes = {
		continueUrl: PropTypes.string.isRequired,
		hideOnboardingWelcomePrompt: PropTypes.func,
		onClose: PropTypes.func,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	static defaultProps = {
		hideOnboardingWelcomePrompt: noop,
		onClose: noop,
		continueUrl: '',
	};

	goToChecklist = () => {
		this.props.recordTracksEvent( 'calypso_onboarding_welcome_click', {
			action_type: 'continue',
			url: this.props.continueUrl,
		} );
		this.onClose();
		page( this.props.continueUrl );
	};

	closeWelcomePrompt = () => {
		this.props.recordTracksEvent( 'calypso_onboarding_welcome_click', {
			action_type: 'close',
			url: this.props.continueUrl,
		} );
		this.onClose();
	};

	onClose = () => {
		this.props.hideOnboardingWelcomePrompt();
		this.props.onClose();
	};

	render() {
		return (
			<div className="checklist-onboarding-welcome">
				<img
					src="/calypso/images/signup/confetti.svg"
					aria-hidden="true"
					className="checklist-onboarding-welcome__confetti"
					alt=""
				/>
				<div className="checklist-onboarding-welcome__content">
					<h2>{ translate( "You're off to a great start!" ) }</h2>
					<p>
						{ translate(
							"Let's get your site ready to launch by walking through a couple of short customization tasks."
						) }
					</p>
					<p className="checklist-onboarding-welcome__task-estimate">
						<Gridicon icon="time" size={ 18 } />
						{ translate( 'Estimated time:' ) }{ ' ' }
						{ translate( '%d minute', '%d minutes', { count: 15, args: [ 15 ] } ) }
					</p>
				</div>
				<div className="checklist-onboarding-welcome__buttons">
					<Button primary={ true } href={ this.props.continueUrl } onClick={ this.goToChecklist }>
						{ translate( 'Start customizing' ) }
					</Button>
					<Button onClick={ this.closeWelcomePrompt }>{ translate( 'Not now' ) }</Button>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		continueUrl: `/checklist/${ getSiteSlug( state, getSelectedSiteId( state ) ) }`,
	} ),
	{
		hideOnboardingWelcomePrompt,
		recordTracksEvent,
	}
)( ChecklistOnboardingWelcome );
