/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find, get, values } from 'lodash';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import sectionsModule from 'sections';
import { Tabs } from '../../constants';

class Navigation extends Component {
	static propTypes = {
		activeTab: PropTypes.string,
		site: PropTypes.object,
	};

	static defaultProps = {
		activeTab: '',
	};

	getSettingsPath() {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'wp-job-manager' ) );

		return get( section, 'settings_path' );
	}

	renderTabItem( { label, slug } ) {
		const { activeTab, site } = this.props;
		const siteSlug = get( site, 'slug' );
		let path = this.getSettingsPath();

		if ( slug ) {
			path += `/${ slug }`;
		}

		if ( siteSlug ) {
			path += `/${ siteSlug }`;
		}

		return (
			<SectionNavTabItem
				key={ slug }
				path={ path }
				selected={ activeTab === slug }>
				{ label }
			</SectionNavTabItem>
		);
	}

	render() {
		return (
			<SectionNav selectedText="Settings">
				<SectionNavTabs>
					{ values( Tabs ).map( tab => this.renderTabItem( tab ) ) }
				</SectionNavTabs>
			</SectionNav>
		);
	}
}

export default localize( Navigation );
