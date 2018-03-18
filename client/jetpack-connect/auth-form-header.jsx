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
import { authQueryPropTypes } from './utils';
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

		if ( this.getPartnerSlug() ) {
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

	getPartnerSlug() {
		const { partnerId } = this.props.authQuery;

		switch ( partnerId ) {
			case 51945:
			case 51946:
				return 'dreamhost';
			case 49615:
			case 49640:
				return 'pressable';
			case 51652: // Clients used for testing.
				return 'dreamhost';
			default:
				return '';
		}
	}

	getHeaderImage() {
		const partnerSlug = this.getPartnerSlug();

		let image = false;
		switch ( partnerSlug ) {
			case 'dreamhost':
				image = '/calypso/images/jetpack/dreamhost-jetpack-logo-group.png';
				break;
			case 'pressable':
				image = '/calypso/images/jetpack/pressable-jetpack-logo-group.png';
				break;
		}

		if ( ! image ) {
			return null;
		}

		return (
			<div className="jetpack-connect__auth-form-header-image">
				<img width={ 128 } height={ 42.5 } src={ image } />
			</div>
		);
	}

	getHeaderText() {
		const { translate } = this.props;
		const partnerSlug = this.getPartnerSlug();

		if ( partnerSlug ) {
			switch ( partnerSlug ) {
				case 'dreamhost':
					return translate( 'In partnership with Dreamhost' );
				case 'pressable':
					return translate( 'In partnership with Pressable' );
				default:
					return translate( 'Completing connection' );
			}
		}

		switch ( this.getState() ) {
			case 'logged-out':
				return translate( 'Create an account to set up Jetpack' );
			case 'logged-in-success':
				return translate( 'You are connected!' );
			case 'logged-in':
			default:
				return translate( 'Completing connection' );
		}
	}

	getSubHeaderText() {
		const { translate } = this.props;

		switch ( this.getState() ) {
			case 'logged-out':
				return translate( 'You are moments away from connecting your site.' );
			case 'logged-in-success':
				return translate( 'Thank you for flying with Jetpack' );
			case 'partner':
				return translate( 'Your new plan requires a connection to WordPress.com' );
			case 'logged-in':
			default:
				return translate( 'Jetpack is finishing up the connection process' );
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
				{ this.getHeaderImage() }
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
