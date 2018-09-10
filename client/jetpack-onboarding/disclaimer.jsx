/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import GridiconInfoOutline from 'gridicons/dist/info-outline';
import { localize } from 'i18n-calypso';

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
				<GridiconInfoOutline size={ 18 } />
				{ translate( 'By continuing, you agree to our {{link}}Terms of Service{{/link}}.', {
					components: {
						link: (
							<a
								href="//wordpress.com/tos/"
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
