/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import Main from 'components/main';
import { getPartnerSlugFromId } from './utils';
import { retrieveMobileRedirect } from './persistence-utils';

class JetpackConnectMainWrapper extends PureComponent {
	static propTypes = {
		isWide: PropTypes.bool,
		partnerId: PropTypes.number,
	};

	static defaultProps = {
		isWide: false,
	};

	getHeaderImage() {
		const { partnerId, translate } = this.props;
		const partnerSlug = getPartnerSlugFromId( partnerId );
		const baseCobrandedAttributes = {
			width: '662.5',
			height: '85',
			className: 'jetpack-connect__main-partner-logo',
		};

		let image = null;
		if ( partnerSlug ) {
			switch ( partnerSlug ) {
				case 'dreamhost':
					image = (
						<img
							{ ...baseCobrandedAttributes }
							src="/calypso/images/jetpack/jetpack-dreamhost-connection.png"
							alt={ translate( 'Co-branded Jetpack and DreamHost logo' ) }
						/>
					);
					break;

				case 'pressable':
					image = (
						<img
							{ ...baseCobrandedAttributes }
							src="/calypso/images/jetpack/jetpack-pressable-connection.png"
							alt={ translate( 'Co-branded Jetpack and Pressable logo' ) }
						/>
					);
					break;

				case 'milesweb':
					image = (
						<img
							{ ...baseCobrandedAttributes }
							src="/calypso/images/jetpack/jetpack-milesweb-connection.png"
							alt={ translate( 'Co-branded Jetpack and MilesWeb logo' ) }
						/>
					);
					break;

				case 'bluehost':
					image = (
						<img
							{ ...baseCobrandedAttributes }
							src="/calypso/images/jetpack/jetpack-bluehost-connection.png"
							alt={ translate( 'Co-branded Jetpack and Bluehost logo' ) }
						/>
					);
					break;
			}
		}

		return (
			<div className="jetpack-connect__main-logo">
				{ image || <JetpackLogo full size={ 45 } /> }
			</div>
		);
	}

	render() {
		const { isWide, className, children } = this.props;
		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
		} );

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				{ this.getHeaderImage() }
				{ children }
			</Main>
		);
	}
}

export default localize( JetpackConnectMainWrapper );
