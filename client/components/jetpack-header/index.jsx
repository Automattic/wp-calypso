/** @format */

/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import JetpackBluehostLogo from './bluehost';
import JetpackDreamhostLogo from './dreamhost';
import JetpackInmotionLogo from './inmotion';
import JetpackLogo from 'components/jetpack-logo';
import JetpackMileswebLogo from './milesweb';
import JetpackPressableLogo from './pressable';

export class JetpackHeader extends PureComponent {
	static displayName = 'JetpackHeader';

	static propTypes = {
		partnerSlug: PropTypes.string,
	};

	renderPartnerLogoGroup( partnerName, partnerLogo, width, viewBox ) {
		const { translate } = this.props;

		return (
			<svg width={ width } viewBox={ viewBox }>
				<title>
					{ translate( 'Co-branded Jetpack and %(partnerName)s logo', {
						args: {
							partnerName,
						},
					} ) }
				</title>
				<g fill="none" fillRule="evenodd">
					<g id="SVGs">
						<g id="Jetpack-+-Partner">
							<g transform="translate(219 35.082353)">
								<Gridicon icon="plus-small" size={ 72 } />
							</g>
							{ partnerLogo }
							<JetpackLogo size={ 150 } />
						</g>
					</g>
				</g>
			</svg>
		);
	}

	renderLogo() {
		const { partnerSlug } = this.props;

		switch ( partnerSlug ) {
			case 'dreamhost':
				return this.renderPartnerLogoGroup(
					'DreamHost',
					<JetpackDreamhostLogo />,
					'662.5',
					'0 0 1270 170'
				);

			case 'pressable':
				return this.renderPartnerLogoGroup(
					'Pressable',
					<JetpackPressableLogo />,
					'662.5',
					'0 0 1150 170'
				);

			case 'bluehost':
				return this.renderPartnerLogoGroup(
					'Bluehost',
					<JetpackBluehostLogo />,
					'662.5',
					'0 0 1128 170'
				);

			case 'inmotion':
				return this.renderPartnerLogoGroup(
					'InMotion',
					<JetpackInmotionLogo />,
					'550',
					'0 0 936 151'
				);

			case 'milesweb':
				// This is a raster logo that contains the Jetpack logo already.
				return <JetpackMileswebLogo />;

			default:
				return <JetpackLogo full size={ 45 } />;
		}
	}

	render() {
		return <div className="jetpack-header">{ this.renderLogo() }</div>;
	}
}

export default localize( JetpackHeader );
