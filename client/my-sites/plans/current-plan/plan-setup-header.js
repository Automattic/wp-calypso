/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ProgressBar from 'components/progress-bar';

export class PlanSetupHeader extends Component {
	static propTypes = {};

	render() {
		const { translate } = this.props;
		return (
			<Card>
				<img alt="" aria-hidden="true" src="/calypso/images/illustrations/fireworks.svg" />
				<ProgressBar isPlusing total={ 100 } value={ 10 } />
				<div>
					<a href={ /* @TODO (sirreal) fix this */ document.location.pathname }>
						{ translate( 'Skip setup. I’ll do this later.' ) }
					</a>
				</div>
			</Card>
		);
	}
}

export default localize( PlanSetupHeader );
