/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, get, trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import SectionNavSegmented from 'components/section-nav/segmented';
import Button from 'components/button';
import sectionsModule from 'sections';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const getZones = () => {
	return [
		{ label: 'Foo', slug: 'foo' },
		{ label: 'Bar', slug: 'bar' },
		{ label: 'Baz', slug: 'baz' },
		{ label: 'Boo', slug: 'boo' },
	];
};

const Navigation = ( { activeTab, siteSlug, translate } ) => {
	const getSettingsPath = () => {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'zoninator' ) );

		return get( section, 'settings_path' );
	};

	const renderTab = ( { label, slug } ) => {
		const path = trimEnd( `${ getSettingsPath() }/${ siteSlug }/${ slug }`, '/' );

		return (
			<SectionNavTabItem
				key={ slug }
				path={ path }
				selected={ activeTab === slug }>
				{ label }
			</SectionNavTabItem>
		);
	};

	return (
		<SectionNav>
			<SectionNavTabs>
				{ getZones().map( zone => renderTab( zone ) ) }
			</SectionNavTabs>

			<SectionNavSegmented label="actions">
				<Button path={ `${ getSettingsPath() }/${ siteSlug }` }>
					{ translate( 'New Zone' ) }
				</Button>
			</SectionNavSegmented>
		</SectionNav>
	);
};

Navigation.propTypes = {
	activeTab: PropTypes.string,
	siteSlug: PropTypes.string,
};

Navigation.defaultProps = {
	activeTab: '',
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( Navigation );
