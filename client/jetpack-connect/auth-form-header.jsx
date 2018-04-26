/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import urlModule from 'url';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormattedHeader from 'components/formatted-header';
import safeImageUrl from 'lib/safe-image-url';
import Site from 'blocks/site';
import versionCompare from 'lib/version-compare';
import { authQueryPropTypes, getPartnerSlug } from './utils';
import { decodeEntities } from 'lib/formatting';
import { getAuthorizationData } from 'state/jetpack-connect/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

export class AuthFormHeader extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,

		// Connected props
		translate: PropTypes.func.isRequired,
		user: PropTypes.object,
	};

	getState() {
		const { user, authorize } = this.props;

		if ( getPartnerSlug( this.props.authQuery ) ) {
			return 'partner';
		}

		if ( ! user ) {
			return 'logged-out';
		}

		if ( authorize.authorizeSuccess ) {
			return 'logged-in-success';
		}

		return 'logged-in';
	}

	getHeaderText() {
		const { translate } = this.props;
		const partnerSlug = getPartnerSlug( this.props.authQuery );

		if ( partnerSlug ) {
			switch ( partnerSlug ) {
				case 'dreamhost':
					return translate( 'Jetpack, in partnership with Dreamhost' );
				case 'pressable':
					return translate( 'Jetpack, in partnership with Pressable' );
				case 'milesweb':
					return translate( 'Jetpack, in partnership with MilesWeb' );
				case 'bluehost':
					return translate( 'Jetpack, in partnership with Bluehost' );
				default:
					return translate( 'Completing set up' );
			}
		}

		switch ( this.getState() ) {
			case 'logged-out':
				return translate( 'Create an account to set up Jetpack' );
			case 'logged-in-success':
				return translate( "You're all set!" );
			case 'logged-in':
			default:
				return translate( 'Completing set up' );
		}
	}

	getSubHeaderText() {
		const { translate } = this.props;

		switch ( this.getState() ) {
			case 'logged-out':
				return translate( 'You are moments away from a better WordPress.' );
			case 'logged-in-success':
				return translate( 'Thank you for flying with Jetpack' );
			case 'partner':
				return translate( 'Your new plan requires a connection to WordPress.com' );
			case 'logged-in':
			default:
				return translate( 'Jetpack is finishing set up' );
		}
	}

	getSiteCard() {
		const { jpVersion } = this.props.authQuery;
		if ( ! versionCompare( jpVersion, '4.0.3', '>' ) ) {
			return null;
		}

		const { blogname, homeUrl, siteIcon, siteUrl } = this.props.authQuery;
		const safeIconUrl = siteIcon ? safeImageUrl( siteIcon ) : false;
		const icon = safeIconUrl ? { img: safeIconUrl } : false;
		const url = decodeEntities( homeUrl );
		const parsedUrl = urlModule.parse( url );
		const path = parsedUrl.path === '/' ? '' : parsedUrl.path;
		const site = {
			admin_url: decodeEntities( siteUrl + '/wp-admin' ),
			domain: parsedUrl.host + path,
			icon,
			ID: null,
			is_vip: false,
			title: decodeEntities( blogname ),
			url: url,
		};

		return (
			<CompactCard className="jetpack-connect__site">
				<Site site={ site } />
			</CompactCard>
		);
	}

	render() {
		return (
			<div>
				<FormattedHeader
					headerText={ this.getHeaderText() }
					subHeaderText={ this.getSubHeaderText() }
				/>
				{ this.getSiteCard() }
			</div>
		);
	}
}

export default connect( state => {
	return {
		authorize: getAuthorizationData( state ),
		user: getCurrentUser( state ),
	};
} )( localize( AuthFormHeader ) );
