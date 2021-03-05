/**
 * External dependencies
 *
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Card } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import { getLink } from 'woocommerce/lib/nav-utils';
import SettingsNavigation from '../navigation';

class SettingsTaxesTaxJar extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			options: PropTypes.shape( {
				admin_url: PropTypes.string.isRequired,
			} ),
		} ).isRequired,
	};

	render = () => {
		const { site, translate } = this.props;

		const breadcrumbs = [
			<a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a>,
			<span>{ translate( 'Taxes' ) }</span>,
		];

		const adminUrl =
			site.options.admin_url +
			'admin.php?page=wc-settings&tab=integration&section=taxjar-integration';
		const pluginUrl = getLink( '/plugins/taxjar-simplified-taxes-for-woocommerce/:site', site );

		return (
			<div>
				<ActionHeader breadcrumbs={ breadcrumbs } />
				<SettingsNavigation activeSection="taxes" />
				<div>
					<Card className="taxes__tax-jar-info">
						<p>
							{ translate(
								"Your store's taxes are being managed by the {{b}}TaxJar - Sales Tax Automation " +
									'for WooCommerce{{/b}} plugin. This optional plugin provides features such as:',
								{
									components: {
										b: <strong />,
									},
								}
							) }
						</p>
						<ul>
							<li>{ translate( 'Automated reporting & filing' ) }</li>
							<li>{ translate( 'Multi-nexus support' ) }</li>
						</ul>
						<p>
							{ translate(
								"If you don't need these features we recommend {{a}}removing this plugin{{/a}}. Don't worry, " +
									"{{b}}we'll still handle sales tax calculations for you{{/b}}.",
								{
									components: {
										a: <a href={ pluginUrl } />,
										b: <strong />,
									},
								}
							) }
						</p>
						<p>
							{ translate( "You can manage this plugin's settings in wp-admin. " ) }
							<ExternalLink icon href={ adminUrl } rel="noopener noreferrer">
								{ translate( 'Plugin settings' ) }
							</ExternalLink>
						</p>
					</Card>
				</div>
			</div>
		);
	};
}
export default localize( SettingsTaxesTaxJar );
