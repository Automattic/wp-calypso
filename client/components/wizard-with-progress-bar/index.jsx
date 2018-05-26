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
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		const value = 10, total = 100;

		return (
			<CompactCard className="wizard-with-progress-bar">
				<Button>
					{ translate( 'Back' ) }
				</Button>

				<ProgressBar value={ value } total={ total } />

				<Button primary>
					{ translate( 'Next' ) }
				</Button>
			</CompactCard>
		);
	}
}

export default localize( WizardWithProgressBar );
