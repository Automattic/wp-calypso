import { localize } from 'i18n-calypso';
import { get, map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import HeaderCake from 'calypso/components/header-cake';
import SectionNav from 'calypso/components/section-nav';
import SectionNavTabItem from 'calypso/components/section-nav/item';
import SectionNavTabs from 'calypso/components/section-nav/tabs';
import { addSiteFragment } from 'calypso/lib/route';
import versionCompare from 'calypso/lib/version-compare';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { Tabs } from '../../app/constants';

const Navigation = ( { activeTab, pluginVersion, siteSlug, translate } ) => (
	<div>
		<HeaderCake
			backText={ translate( 'Plugin Overview' ) }
			backHref={ siteSlug && addSiteFragment( '/plugins/wp-super-cache', siteSlug ) }
		>
			WP Super Cache
		</HeaderCake>
		<SectionNav selectedText="Settings">
			<SectionNavTabs>
				{ map( Tabs, ( { label, slug: tabSlug, minVersion } ) => {
					if ( ! versionCompare( minVersion, pluginVersion, '<=' ) ) {
						return null;
					}

					return (
						<SectionNavTabItem
							key={ `wp-super-cache-${ tabSlug || 'easy' }` }
							path={
								siteSlug && addSiteFragment( '/extensions/wp-super-cache/' + tabSlug, siteSlug )
							}
							selected={ activeTab === tabSlug }
						>
							{ label }
						</SectionNavTabItem>
					);
				} ) }
			</SectionNavTabs>
		</SectionNav>
	</div>
);

Navigation.propTypes = {
	activeTab: PropTypes.string,
	siteId: PropTypes.number,
	// connected props
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

Navigation.defaultProps = {
	activeTab: '',
};

const connectComponent = connect( ( state, { siteId } ) => ( {
	pluginVersion: get( getPluginOnSite( state, siteId, 'wp-super-cache' ), 'version' ),
	siteSlug: getSiteSlug( state, siteId ),
} ) );

export default connectComponent( localize( Navigation ) );
