/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isFinite } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ProgressBar from 'components/progress-bar';

export class PlanSetupHeader extends Component {
	static propTypes = {
		progressComplete: PropTypes.number,
		progressTotal: PropTypes.number,
	};

	render() {
		const { translate } = this.props;
		return (
			<Card className="thank-you-header">
				<img
					className="thank-you-header__illustration"
					alt=""
					aria-hidden="true"
					src="/calypso/images/illustrations/fireworks.svg"
				/>
				<h1 className="thank-you-header__title">{ translate( 'Thank you for your purchase!' ) }</h1>
				<p>
					{ translate(
						'Your website is on a %(planName)s plan for $(duration)s. Let’s walk through a short checklist of essential security features for safeguarding your website.',
						{
							args: {
								/**
								 * @TODO (sirreal) real props
								 */
								planName: 'Jetpack Premium',
								duration: '1 month',
							},
						}
					) }
				</p>
				<p>
					{ translate(
						'We’ve taken the liberty of starting the first two items, since they’re key to your site’s safety: we’re configuring spam filtering and backups for you now. Once that’s done, we can work through the rest of the checklist.'
					) }
				</p>
				{ /* can be 0 */ isFinite( this.props.progressComplete ) &&
					/* shouldn't be 0 */ this.props.progressTotal && (
						<ProgressBar
							isPulsing
							total={ this.props.progressTotal }
							value={ this.props.progressComplete }
						/>
					) }
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
