/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

import JetpackLogo from 'components/jetpack-logo';
import JetpackPartnerLogoGroup from './partner-logo-group';

/**
 * Style dependencies
 */
import './style.scss';

export class JetpackHeader extends PureComponent {
	static displayName = 'JetpackHeader';

	static propTypes = {
		darkColorScheme: PropTypes.bool,
		partnerSlug: PropTypes.string,
		isWoo: PropTypes.bool,
		isWooDna: PropTypes.bool,
		width: PropTypes.number,
	};

	renderLogo() {
		const { darkColorScheme, partnerSlug, width, isWoo, isWooDna, translate } = this.props;

		if ( isWoo ) {
			// @todo Implement WooCommerce + partner co-branding in the future.
			return (
				<JetpackPartnerLogoGroup
					width={ width || 662.5 }
					viewBox="0 0 1270 170"
					partnerName="WooCommerce"
				>
					<AsyncLoad
						require="components/jetpack-header/woocommerce"
						darkColorScheme={ darkColorScheme }
						placeholder={ null }
					/>
				</JetpackPartnerLogoGroup>
			);
		}

		if ( isWooDna ) {
			return (
				<svg width={ width } viewBox="0 0 1270 170">
					<title>{ translate( 'WooCommerce logo' ) }</title>
					<g fill="none" fillRule="evenodd">
						<g transform="translate(-120)">
							<AsyncLoad
								require="components/jetpack-header/woocommerce"
								darkColorScheme={ darkColorScheme }
								placeholder={ null }
							/>
						</g>
					</g>
				</svg>
			);
		}

		switch ( partnerSlug ) {
			case 'dreamhost':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 662.5 }
						viewBox="0 0 1270 170"
						partnerName="DreamHost"
					>
						<AsyncLoad
							require="components/jetpack-header/dreamhost"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'pressable':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 600 }
						viewBox="0 0 1150 170"
						partnerName="Pressable"
					>
						<AsyncLoad
							require="components/jetpack-header/pressable"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'bluehost':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 588 }
						viewBox="0 0 1128 170"
						partnerName="Bluehost"
					>
						<AsyncLoad
							require="components/jetpack-header/bluehost"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'inmotion':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 488 }
						viewBox="0 0 936 151"
						partnerName="InMotion"
					>
						<AsyncLoad
							require="components/jetpack-header/inmotion"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);

			case 'milesweb':
				// This is a raster logo that contains the Jetpack logo already.
				return (
					<AsyncLoad
						require="components/jetpack-header/milesweb"
						darkColorScheme={ darkColorScheme }
						placeholder={ null }
					/>
				);

			case 'liquidweb':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 488 }
						viewBox="0 0 1034 150"
						partnerName="Liquid Web"
					>
						<AsyncLoad
							require="components/jetpack-header/liquidweb"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);
			case 'eurodns':
				return (
					<JetpackPartnerLogoGroup
						width={ width || 488 }
						viewBox="0 0 1034 150"
						partnerName="EuroDNS"
					>
						<AsyncLoad
							require="components/jetpack-header/eurodns"
							darkColorScheme={ darkColorScheme }
							placeholder={ null }
						/>
					</JetpackPartnerLogoGroup>
				);
			default:
				return <JetpackLogo full size={ width || 45 } />;
		}
	}

	render() {
		return <div className="jetpack-header">{ this.renderLogo() }</div>;
	}
}

export default localize( JetpackHeader );
