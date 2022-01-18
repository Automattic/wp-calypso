import { Card } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
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
	size,
} ) => {
	const isWide = useBreakpoint( '>1280px' );

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

	return (
		<div className="plugins-browser-list">
			<div className="plugins-browser-list__header">
				<div className={ classnames( 'plugins-browser-list__title', listName ) }>
					{ title }
					{ setBillingPeriod && (
						<BillingIntervalSwitcher
							billingPeriod={ billingPeriod }
							onChange={ setBillingPeriod }
							compact={ ! isWide }
						/>
					) }
				</div>
				<div className="plugins-browser-list__subtitle">{ subtitle }</div>
			</div>
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
