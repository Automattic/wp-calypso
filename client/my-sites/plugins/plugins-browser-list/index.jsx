import { isEnabled } from '@automattic/calypso-config';
import { Card, Gridicon } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import PluginSpotlight from 'calypso/my-sites/plugins/plugin-spotlight';
import PluginBrowserItem from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import { PluginsBrowserListVariant } from './types';

import './style.scss';

const DEFAULT_PLACEHOLDER_NUMBER = 6;

const PluginsBrowserList = ( {
	plugins,
	variant = PluginsBrowserListVariant.Fixed,
	title,
	subtitle,
	extended,
	billingPeriod,
	setBillingPeriod,
	showPlaceholders,
	site,
	currentSites,
	listName,
	expandedListLink,
	size,
} ) => {
	const isWide = useBreakpoint( '>1280px' );
	const { __ } = useI18n();

	const renderPluginsViewList = () => {
		const pluginsViewsList = plugins.map( ( plugin, n ) => {
			return (
				<PluginBrowserItem
					site={ site }
					key={ plugin.slug + n }
					plugin={ plugin }
					currentSites={ currentSites }
					listName={ listName }
					variant={
						extended ? PluginsBrowserElementVariant.Extended : PluginsBrowserElementVariant.Compact
					}
					billingPeriod={ billingPeriod }
				/>
			);
		} );

		if ( size ) {
			return pluginsViewsList.slice( 0, size );
		}

		return pluginsViewsList;
	};

	const renderPlaceholdersViews = () => {
		return times( size || DEFAULT_PLACEHOLDER_NUMBER, ( i ) => (
			<PluginBrowserItem isPlaceholder key={ 'placeholder-plugin-' + i } />
		) );
	};

	const renderViews = () => {
		if ( ! plugins.length ) {
			return renderPlaceholdersViews();
		}

		switch ( variant ) {
			case PluginsBrowserListVariant.InfiniteScroll:
				if ( showPlaceholders ) {
					return renderPluginsViewList().concat( renderPlaceholdersViews() );
				}
				return renderPluginsViewList();
			case PluginsBrowserListVariant.Paginated:
				if ( showPlaceholders ) {
					return renderPlaceholdersViews();
				}
				return renderPluginsViewList();
			case PluginsBrowserListVariant.Fixed:
			default:
				return renderPluginsViewList();
		}
	};

	const eligiblePlugins = [
		{
			slug: 'wordpress-seo-premium',
			tagline: __( 'Drive more traffic with Yoast SEO Premium' ),
			title: __( 'Under the Spotlight' ),
			cta: __( 'View Details' ),
		},
		// delete everything below this and replace with Sensei Pro this is being used as a proof of concept
		{
			slug: 'woocommerce-subscriptions',
			tagline: __( 'Let your customer subscribe with Woocommerce Subscriptions' ),
			title: __( 'Under the Spotlight' ),
			cta: __( 'Start now' ),
		},
		{
			slug: 'woocommerce-bookings',
			tagline: __( 'Let your customer book with WooCommerce Bookings' ),
			title: __( 'Under the Spotlight' ),
			cta: __( 'Start now' ),
		},
	];

	return (
		<div className="plugins-browser-list">
			<div className="plugins-browser-list__header">
				<div className="plugins-browser-list__titles">
					<div className={ classnames( 'plugins-browser-list__title', listName ) }>{ title }</div>
					<div className="plugins-browser-list__subtitle">{ subtitle }</div>
				</div>
				<div className="plugins-browser-list__actions">
					{ setBillingPeriod && (
						<BillingIntervalSwitcher
							billingPeriod={ billingPeriod }
							onChange={ setBillingPeriod }
							compact={ ! isWide }
						/>
					) }
					{ expandedListLink && (
						<a className="plugins-browser-list__browse-all" href={ expandedListLink }>
							{ __( 'Browse All' ) }
							<Gridicon icon="arrow-right" size="18" />
						</a>
					) }
				</div>
			</div>
			{ listName === 'paid' && isEnabled( 'marketplace-spotlight' ) && (
				<PluginSpotlight eligiblePlugins={ eligiblePlugins } currentSites={ currentSites } />
			) }
			<Card className="plugins-browser-list__elements">{ renderViews() }</Card>
		</div>
	);
};

PluginsBrowserList.propTypes = {
	plugins: PropTypes.array.isRequired,
	variant: PropTypes.oneOf( Object.values( PluginsBrowserListVariant ) ).isRequired,
	extended: PropTypes.bool,
};

export default PluginsBrowserList;
