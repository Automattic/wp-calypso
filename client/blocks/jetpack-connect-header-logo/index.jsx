/** @format */

/**
 * External Dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPartnerSlugFromQuery } from 'state/selectors';
import JetpackLogo from 'components/jetpack-logo';

export class JetpackConnectHeaderLogo extends PureComponent {
	static propTypes = {
		partnerSlug: PropTypes.string,
	};

	renderPartnerLogo() {
		const { translate, partnerSlugFromQuery } = this.props;
		const partnerSlug = this.props.partnerSlug || partnerSlugFromQuery;
		const baseCobrandedAttributes = {
			width: '662.5',
			height: '85',
			className: 'jetpack-connect-header-logo__cobranded-logo',
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
			default:
				return null;
		}
	}

	render() {
		return (
			<div className="jetpack-connect-header-logo">
				{ this.renderPartnerLogo() || <JetpackLogo full size={ 45 } /> }
			</div>
		);
	}
}

const mapStateToProps = state => ( {
	partnerSlugFromQuery: getPartnerSlugFromQuery( state ),
} );

export default connect( mapStateToProps )( localize( JetpackConnectHeaderLogo ) );
