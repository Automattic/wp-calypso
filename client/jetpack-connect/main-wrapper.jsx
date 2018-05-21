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
import { retrieveMobileRedirect } from './persistence-utils';

export class JetpackConnectMainWrapper extends PureComponent {
	static propTypes = {
		isWide: PropTypes.bool,
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isWide: false,
	};

	getHeaderImage() {
		const { partnerSlug, translate } = this.props;
		const baseCobrandedAttributes = {
			width: '662.5',
			height: '85',
			className: 'jetpack-connect__main-partner-logo',
		};

		switch ( partnerSlug ) {
			case 'dreamhost':
				return (
					<img
						{ ...baseCobrandedAttributes }
						src="/calypso/images/jetpack/jetpack-dreamhost-connection.png"
						alt={ translate( 'Co-branded Jetpack and DreamHost logo' ) }
					/>
				);

			case 'pressable':
				return (
					<img
						{ ...baseCobrandedAttributes }
						src="/calypso/images/jetpack/jetpack-pressable-connection.png"
						alt={ translate( 'Co-branded Jetpack and Pressable logo' ) }
					/>
				);

			case 'milesweb':
				return (
					<img
						{ ...baseCobrandedAttributes }
						src="/calypso/images/jetpack/jetpack-milesweb-connection.png"
						alt={ translate( 'Co-branded Jetpack and MilesWeb logo' ) }
					/>
				);

			case 'bluehost':
				return (
					<img
						{ ...baseCobrandedAttributes }
						src="/calypso/images/jetpack/jetpack-bluehost-connection.png"
						alt={ translate( 'Co-branded Jetpack and Bluehost logo' ) }
					/>
				);
		}

		return <JetpackLogo full size={ 45 } />;
	}

	render() {
		const { isWide, className, children } = this.props;
		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
		} );

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				<div className="jetpack-connect__main-logo">{ this.getHeaderImage() }</div>
				{ children }
			</Main>
		);
	}
}

export default localize( JetpackConnectMainWrapper );
