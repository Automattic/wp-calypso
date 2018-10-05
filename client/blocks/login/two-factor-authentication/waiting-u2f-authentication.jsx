/** @format */

/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import TwoFactorActions from './two-factor-actions';

class WaitingU2fAuthentication extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<form>
				<Card className="two-factor-authentication__push-notification-screen is-compact">
					<p>
						{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
							components: {
								strong: <strong />,
							},
						} ) }
					</p>
					<p>
						{ translate(
							'Insert your security key into your USB port. Then tap the button or gold disc.'
						) }
					</p>
				</Card>

				<TwoFactorActions twoFactorAuthType="u2f" />
			</form>
		);
	}
}

export default localize( WaitingU2fAuthentication );
