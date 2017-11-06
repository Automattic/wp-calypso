/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ExternalLink from 'components/external-link';
import { getLink } from 'woocommerce/lib/nav-utils';
import Main from 'components/main';
import SettingsNavigation from '../navigation';

class SettingsTaxesTaxJar extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			options: PropTypes.shape( {
				admin_url: PropTypes.string.isRequired,
			} ),
		} ),
	};

	onDeactivate = event => {
		event.preventDefault();
	};

	render = () => {
		const { className, site, translate } = this.props;

		const breadcrumbs = [
			<a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a>,
			<span>{ translate( 'Taxes' ) }</span>,
		];

		const adminUrl =
			site.options.admin_url +
			'admin.php?page=wc-settings&tab=integration&section=taxjar-integration';
		const pluginUrl = getLink( '/plugins/taxjar-simplified-taxes-for-woocommerce/:site', site );

		return (
			<Main className={ classNames( 'settings-taxes', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs } />
				<SettingsNavigation activeSection="taxes" />
				<div className="taxes__tax-jar">
					<ExtendedHeader
						label={ translate( 'Tax Plugin Detected' ) }
						description={ translate( "A third-party plugin is managing your store's taxes." ) }
					/>
					<Card>
						<p>
							{ translate( "Your store's taxes are being managed by a third-party plugin. " ) }
							<ExternalLink icon href={ adminUrl } rel="noopener noreferrer">
								{ translate( 'Plugin settings' ) }
							</ExternalLink>
						</p>
						<p>
							{ translate( 'Or, if you prefer, you can {{a}}manage or remove this plugin{{/a}}. ', {
								components: {
									a: <a href={ pluginUrl } className="taxes__tax-jar-deactivate" />,
								},
							} ) }
						</p>
					</Card>
				</div>
			</Main>
		);
	};
}
export default localize( SettingsTaxesTaxJar );
