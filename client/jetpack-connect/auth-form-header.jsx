import { safeImageUrl } from '@automattic/calypso-url';
import { CompactCard } from '@automattic/components';
import { Icon, globe } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import FormattedHeader from 'calypso/components/formatted-header';
import { decodeEntities } from 'calypso/lib/formatting';
import { getPluginTitle } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import versionCompare from 'calypso/lib/version-compare';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getAuthorizationData } from 'calypso/state/jetpack-connect/selectors';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
import { authQueryPropTypes } from './utils';

export class AuthFormHeader extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,
		isWooJPC: PropTypes.bool,
		isWpcomMigration: PropTypes.bool,
		wooDnaConfig: PropTypes.object,
		isFromAutomatticForAgenciesPlugin: PropTypes.bool,

		// Connected props
		translate: PropTypes.func.isRequired,
		user: PropTypes.object,
		disableSiteCard: PropTypes.bool,
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
		const {
			translate,
			partnerSlug,
			isWooJPC,
			wooDnaConfig,
			isWpcomMigration,
			isFromAutomatticForAgenciesPlugin,
		} = this.props;

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

		if ( host && ! isWooOnboarding && ! isWooJPC ) {
			return translate( 'Jetpack, in partnership with %(host)s', {
				args: { host },
				comment: '%(host)s is the company name of a hosting partner. Ex. - Pressable',
			} );
		}

		const currentState = this.getState();

		if ( isWooJPC ) {
			switch ( currentState ) {
				case 'logged-out':
					return translate( 'Create an account' );
				default:
					return translate( 'Connect your account' );
			}
		}

		if ( isWpcomMigration ) {
			switch ( currentState ) {
				case 'logged-in':
					return translate( 'Log in to your account' );
			}
		}

		if ( isFromAutomatticForAgenciesPlugin ) {
			switch ( currentState ) {
				case 'logged-out':
					/** @todo redirect to landing page when user is not signed up for A4A. */
					return translate( 'Create an account to set up Automattic for Agencies' );
				case 'logged-in-success':
					return translate( "You're all set!" );
				case 'auth-in-progress':
					return translate( 'Connecting your site' );
				case 'logged-in':
				default:
					return translate( 'Finish connecting your site' );
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
		const {
			translate,
			isWooJPC,
			wooDnaConfig,
			isWpcomMigration,
			isFromAutomatticForAgenciesPlugin,
		} = this.props;
		const currentState = this.getState();

		if ( isWooJPC ) {
			const pluginName = getPluginTitle( this.props.authQuery?.plugin_name, translate );
			const reviewDocLink = (
				<a
					href="https://woocommerce.com/document/connect-your-store-to-a-wordpress-com-account/"
					target="_blank"
					rel="noreferrer"
				/>
			);
			const translateParams = {
				components: {
					br: <br />,
					a: (
						<a
							href={ login( {
								isJetpack: true,
								redirectTo: window.location.href,
								from: this.props.authQuery.from,
								plugin_name: this.props.authQuery.plugin_name,
							} ) }
						/>
					),
				},
				args: { pluginName },
				comment:
					'Link displayed on the Jetpack Connect signup page for users to log in with a WordPress.com account',
			};

			switch ( currentState ) {
				case 'logged-out':
					return translate(
						'To access all of the features and functionality %(pluginName)s, you’ll first need to connect your store to a WordPress.com account. Please create one now, or {{a}}log in{{/a}}. For more information, please {{doc}}review our documentation{{/doc}}.',
						{
							...translateParams,
							components: {
								...translateParams.components,
								doc: reviewDocLink,
							},
						}
					);
				default:
					return translate(
						'To access all of the features and functionality %(pluginName)s, you’ll first need to connect your store to a WordPress.com account. For more information, please {{doc}}review our documentation{{/doc}}.',
						{
							args: { pluginName },
							components: {
								doc: reviewDocLink,
							},
						}
					);
			}
		}

		if ( wooDnaConfig && wooDnaConfig.isWooDnaFlow() ) {
			switch ( currentState ) {
				case 'logged-in-success':
				case 'auth-in-progress':
					return translate( 'Connecting your store' );
				default:
					if ( wooDnaConfig.getFlowName() === 'woodna:woocommerce-payments' ) {
						return translate(
							'Approve your connection. Your account will enable you to start using the features and benefits offered by WooPayments'
						);
					} else if ( wooDnaConfig.getFlowName() === 'woodna:blaze-ads-on-woo' ) {
						const pluginName = wooDnaConfig.getServiceName();
						/* translators: pluginName is the name of the Woo extension that initiated the connection flow */
						return translate(
							'Approve your connection. Your account will enable you to start using the features and benefits offered by %(pluginName)s.',
							{
								args: {
									pluginName,
								},
							}
						);
					}
					return translate( 'Approve your connection' );
			}
		}

		if ( isWpcomMigration ) {
			switch ( currentState ) {
				case 'logged-in':
					return translate( 'Connect your site with your WordPress.com account' );
			}
		}

		if ( isFromAutomatticForAgenciesPlugin ) {
			return undefined;
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
		const { isWpcomMigration, isWooJPC } = this.props;
		const { jpVersion } = this.props.authQuery;
		if (
			// Always show the site card for Woo Core Profiler
			! isWooJPC &&
			! versionCompare( jpVersion, '4.0.3', '>' )
		) {
			return null;
		}

		if ( isWpcomMigration ) {
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
				<Site site={ site } defaultIcon={ isWooJPC ? <Icon icon={ globe } /> : null } />
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
				{ ! this.props.disableSiteCard && this.getSiteCard() }
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
