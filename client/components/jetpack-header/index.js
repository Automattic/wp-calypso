/** @format */

/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import JetpackBluehostLogo from './bluehost';
import JetpackDreamhostLogo from './dreamhost';
import JetpackInmotionLogo from './inmotion';
import JetpackLogo from 'components/jetpack-logo';
import JetpackMileswebLogo from './milesweb';
import JetpackPressableLogo from './pressable';

export default class JetpackHeader extends PureComponent {
	static propTypes = {
		partnerSlug: PropTypes.string,
	};

	renderLogo() {
		const { partnerSlug } = this.props;

		switch ( partnerSlug ) {
			case 'dreamhost':
				return <JetpackDreamhostLogo />;

			case 'pressable':
				return <JetpackPressableLogo />;

			case 'milesweb':
				return <JetpackMileswebLogo />;

			case 'bluehost':
				return <JetpackBluehostLogo />;

			case 'inmotion':
				return <JetpackInmotionLogo />;

			default:
				return <JetpackLogo full size={ 45 } />;
		}
	}

	render() {
		return <div className="jetpack-header">{ this.renderLogo() }</div>;
	}
}
