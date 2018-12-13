/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { localizeUrl } from 'lib/i18n-utils';

class JetpackOnboardingDisclaimer extends React.PureComponent {
	static propTypes = {
		recordJpoEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleTosClick = () => {
		this.props.recordJpoEvent( 'calypso_jpo_tos_clicked' );
	};

	render() {
		const { translate } = this.props;

		return (
			<p className="jetpack-onboarding__disclaimer">
				<Gridicon icon="info-outline" size={ 18 } />
				{ translate( 'By continuing, you agree to our {{link}}Terms of Service{{/link}}.', {
					components: {
						link: (
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ this.handleTosClick }
							/>
						),
					},
				} ) }
			</p>
		);
	}
}

export default localize( JetpackOnboardingDisclaimer );
