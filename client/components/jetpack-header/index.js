/** @format */

/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import JetpackDreamhostLogo from './dreamhost';
import JetpackPressableLogo from './pressable';
import JetpackMileswebLogo from './milesweb';
import JetpackBluehostLogo from './bluehost';
import JetpackInmotionLogo from './inmotion';

export class JetpackHeader extends PureComponent {
	static propTypes = {
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	renderPartnerLogo() {
		const { translate, partnerSlug } = this.props;
		const baseCobrandedAttributes = {
			className: 'jetpack-connect-header-logo__cobranded-logo',
		};

		switch ( partnerSlug ) {
			case 'dreamhost':
				return <JetpackDreamhostLogo { ...baseCobrandedAttributes } />;

			case 'pressable':
				return <JetpackPressableLogo { ...baseCobrandedAttributes } />;

			case 'milesweb':
				return <JetpackMileswebLogo { ...baseCobrandedAttributes } />;

			case 'bluehost':
				return <JetpackBluehostLogo { ...baseCobrandedAttributes } />;

			case 'inmotion':
				return <JetpackInmotionLogo { ...baseCobrandedAttributes } />;

			default:
				return null;
		}
	}

	render() {
		return (
			<div className="jetpack-header">
				{ this.renderPartnerLogo() || <JetpackLogo full size={ 45 } /> }
			</div>
		);
	}
}

export default localize( JetpackHeader );
