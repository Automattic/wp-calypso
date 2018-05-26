/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import ProgressBar from 'components/progress-bar';

class WizardWithProgressBar extends Component {
	static propTypes = {
		nextButtonText: PropTypes.string,
		previousButtonText: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	renderNextButton() {
		const text = this.props.nextButtonText || this.props.translate( 'Next' );

		return (
			<Button primary>
				{ text }
			</Button>
		);
	}

	renderPreviousButton() {
		const text = this.props.previousButtonText || this.props.translate( 'Back' );

		return (
			<Button>
				{ text }
			</Button>
		);
	}

	render() {
		const value = 10, total = 100;

		return (
			<CompactCard className="wizard-with-progress-bar">
				{ this.renderPreviousButton() }

				<ProgressBar value={ value } total={ total } />

				{ this.renderNextButton() }
			</CompactCard>
		);
	}
}

export default localize( WizardWithProgressBar );
