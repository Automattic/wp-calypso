/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Tabs } from '../../app/constants';
import HeaderCake from 'components/header-cake';
import SectionNav from 'components/section-nav';
import SectionNavTabItem from 'components/section-nav/item';
import SectionNavTabs from 'components/section-nav/tabs';
import { addSiteFragment } from 'lib/route/path';
import { getSiteSlug } from 'state/sites/selectors';

const Navigation = ( { activeTab, siteSlug, translate } ) => (
	<div>
		<HeaderCake backText={ translate( 'Plugin Overview' ) }
			backHref={ siteSlug && addSiteFragment( '/plugins/wp-super-cache', siteSlug ) }>
			WP Super Cache
		</HeaderCake>
		<SectionNav selectedText="Settings">
			<SectionNavTabs>
				{ map( Tabs, ( { label, slug: tabSlug } ) => (
					<SectionNavTabItem
						key={ `wp-super-cache-${ tabSlug || 'easy' }` }
						path={ siteSlug && addSiteFragment( '/extensions/wp-super-cache/' + tabSlug, siteSlug ) }
						selected={ activeTab === tabSlug }>
						{ label }
					</SectionNavTabItem>
				) ) }
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

const connectComponent = connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId )
	} )
);

export default connectComponent( localize( Navigation ) );
