/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import config from 'calypso/config';
import FormattedHeader from 'calypso/components/formatted-header';
import safeImageUrl from 'calypso/lib/safe-image-url';
import Site from 'calypso/blocks/site';
import versionCompare from 'calypso/lib/version-compare';
import { authQueryPropTypes } from './utils';
import { decodeEntities } from 'calypso/lib/formatting';
import { getAuthorizationData } from 'calypso/state/jetpack-connect/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';

export class AuthFormHeader extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,
		isWoo: PropTypes.bool,
		wooDnaConfig: PropTypes.object,

		// Connected props
		translate: PropTypes.func.isRequired,
		user: PropTypes.object,
	};

	getState() {
		const { user, authorize, partnerSlug } = this.props;

		if ( partnerSlug ) {
			return 'partner';
		}

		if ( ! user ) {
			return 'logged-out';
		}

		if ( authorize.authorizeSuccess ) {
			return 'logged-in-success';
		}

		if ( authorize.isAuthorizing ) {
			return 'auth-in-progress';
		}

		return 'logged-in';
	}

	getHeaderText() {
		const { translate, partnerSlug, isWoo, wooDnaConfig } = this.props;

		if ( wooDnaConfig && wooDnaConfig.isWooDnaFlow() ) {
			return wooDnaConfig.getServiceName();
		}

		let host = '';
		switch ( partnerSlug ) {
			case 'dreamhost':
				host = 'Dreamhost';
				break;
			case 'pressable':
				host = 'Pressable';
				break;
			case 'milesweb':
				host = 'Milesweb';
				break;
			case 'bluehost':
				host = 'Bluehost';
				break;
			case 'eurodns':
				host = 'EuroDNS';
				break;
		}

		if ( host ) {
			return translate( 'Jetpack, in partnership with %(host)s', {
				args: { host },
				comment: '%(host)s is the company name of a hosting partner. Ex. - Pressable',
			} );
		}

		const currentState = this.getState();

		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && isWoo ) {
			switch ( currentState ) {
				case 'logged-out':
					return translate( 'Create a Jetpack account' );
				default:
					return translate( 'Connecting your store' );
			}
		}

		switch ( currentState ) {
			case 'logged-out':
				return translate( 'Create an account to set up Jetpack' );
			case 'logged-in-success':
				return translate( "You're all set!" );
			case 'logged-in':
			default:
				return translate( 'Completing setup' );
		}
	}

	getSubHeaderText() {
		const { translate, isWoo, wooDnaConfig } = this.props;
		const currentState = this.getState();

		if ( config.isEnabled( 'jetpack/connect/woocommerce' ) && isWoo ) {
			switch ( currentState ) {
				case 'logged-out':
					return translate(
						'Your account will enable you to start using the features and benefits offered by Jetpack & WooCommerce Services.'
					);
				default:
					return translate( "Once connected we'll continue setting up your store" );
			}
		}

		if ( wooDnaConfig && wooDnaConfig.isWooDnaFlow() ) {
			switch ( currentState ) {
				case 'logged-in-success':
				case 'auth-in-progress':
					return translate( 'Connecting your store' );
				default:
					return translate( 'Approve your connection' );
			}
		}

		switch ( currentState ) {
			case 'logged-out':
				return translate( 'You are moments away from a better WordPress.' );
			case 'logged-in-success':
				return translate( 'Thank you for flying with Jetpack' );
			case 'partner':
				return translate( 'Your new plan requires a connection to WordPress.com' );
			case 'logged-in':
			default:
				return translate( 'Jetpack is finishing setup' );
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
		const parsedUrl = new URL( url );
		const path = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname;
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

export default connect( ( state ) => {
	return {
		authorize: getAuthorizationData( state ),
		user: getCurrentUser( state ),
		partnerSlug: getPartnerSlugFromQuery( state ),
	};
} )( localize( AuthFormHeader ) );
