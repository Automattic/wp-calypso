/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { domainManagementEdit } from 'my-sites/upgrades/paths';
import { googleAppsSettingsUrl } from 'lib/google-apps';
import Gridicon from 'components/gridicon';
import { isBusiness, isGoogleApps, isPlan, isTheme } from 'lib/products-values';
import { oldShowcaseUrl } from 'lib/themes/helpers';

const CancelPurchaseProductInformation = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	render() {
		const { purchase } = this.props;

		if ( isPlan( purchase ) ) {
			return this.renderPlanInformation();
		}

		if ( isGoogleApps( purchase ) ) {
			return this.renderGoogleAppsInformation();
		}

		if ( isTheme( purchase ) ) {
			return this.renderThemeInformation();
		}

		return this.renderDomainInformation();
	},

	renderPlanInformation() {
		const { domain } = this.props.purchase,
			comparePlansUrl = `/plans/compare/${ domain }`,
			plansUrl = `/plans/${ domain }`;

		return (
			<p>
				{ this.renderPlanDescription() }
				<br />

				<a href={ comparePlansUrl }>{ this.translate( 'View Plan Features' ) }</a>
				<span> | </span>
				<a href={ plansUrl }>{ this.translate( 'Change Plan' ) }</a>
			</p>
		);
	},

	renderPlanDescription() {
		const { siteName } = this.props.purchase;
		let description;

		if ( isBusiness( this.props.purchase ) ) {
			description = this.translate(
				'WordPress.com Business for {{a}}%(siteName)s {{icon}}{{/icon}}{{/a}}, ' +
				'which includes a free custom domain, advanced customization features, ' +
				'live chat support, unlimited access to our premium themes and more.',
				{
					args: {
						siteName
					},
					components: {
						a: this.siteLink(),
						icon: this.externalIcon()
					}
				}
			);
		} else {
			description = this.translate(
				'WordPress.com Premium for {{a}}%(siteName)s {{icon}}{{/icon}}{{/a}}, ' +
				'which includes a free custom domain, advanced customization features, and more.',
				{
					args: {
						siteName
					},
					components: {
						a: this.siteLink(),
						icon: this.externalIcon()
					}
				}
			);
		}

		return description;
	},

	siteLink() {
		const siteUrl = `http://${ this.props.purchase.domain }/`;

		return <a href={ siteUrl } target="_blank" />;
	},

	externalIcon() {
		return <Gridicon size={ 14 } icon="external" />;
	},

	renderDomainInformation() {
		const { meta: domainName, productName, siteName } = this.props.purchase;

		return (
			<p>
				{ this.translate( '%(productName)s (%(domainName)s) for {{a}}%(siteName)s {{icon}}{{/icon}}{{/a}}.', {
					args: {
						domainName,
						productName,
						siteName
					},
					components: {
						a: this.siteLink(),
						icon: this.externalIcon()
					}
				} ) }
				<br />

				<a href={ domainManagementEdit( this.props.selectedSite.domain, domainName ) }>{ this.translate( 'Manage Domains' ) }</a>
			</p>
		);
	},

	renderGoogleAppsInformation() {
		const { meta: domainName, siteName } = this.props.purchase;

		return (
			<p>
				{ this.translate( 'Google Apps (%(domainName)s) for {{a}}%(siteName)s {{icon}}{{/icon}}{{/a}}.', {
					args: {
						domainName,
						siteName
					},
					components: {
						a: this.siteLink(),
						icon: this.externalIcon()
					}
				} ) }
				<br />

				<a href={ googleAppsSettingsUrl( this.props.purchase.meta ) }
					target="_blank">{ this.translate( 'Google Apps Settings' ) }</a>
			</p>
		);
	},

	renderThemeInformation() {
		const { domain, meta, productName, siteName } = this.props.purchase,
			themeDetailsUrl = `${ oldShowcaseUrl }${ domain }/${ meta }`,
			themeSelectUrl = `${ oldShowcaseUrl }${ domain }`;

		return (
			<p>
				{ this.translate(
					'%(productName)s Premium Theme for {{a}}%(siteName)s {{icon}}{{/icon}}{{/a}}.',
					{
						args: {
							productName,
							siteName
						},
						components: {
							a: this.siteLink(),
							icon: this.externalIcon()
						}
					}
				) }
				<br />

				<a href={ themeDetailsUrl }>{ this.translate( 'View Theme Details' ) }</a>
				<span> | </span>
				<a href={ themeSelectUrl }>{ this.translate( 'Pick Another Theme' ) }</a>
			</p>
		);
	}
} );

export default CancelPurchaseProductInformation;
