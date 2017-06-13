/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find, get } from 'lodash';

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

	getLabel( slug ) {
		const { JOB_LISTINGS, JOB_SUBMISSION, PAGES } = Tabs;

		switch ( slug ) {
			case JOB_LISTINGS.slug:
				return JOB_LISTINGS.label;
			case JOB_SUBMISSION.slug:
				return JOB_SUBMISSION.label;
			case PAGES.slug:
				return PAGES.label;
		}
	}

	getTabs() {
		const tabs = [];

		for ( const key in Tabs ) {
			if ( Tabs.hasOwnProperty( key ) ) {
				tabs.push( Tabs[ key ] );
			}
		}

		return tabs;
	}

	getSettingsPath() {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'wp-job-manager' ) );

		return get( section, 'settings_path' );
	}

	renderTabItems( tabs ) {
		const { slug: listingsSlug } = Tabs.JOB_LISTINGS;
		const { activeTab, site } = this.props;

		return tabs.map( ( { slug: tabSlug } ) => {
			let path = this.getSettingsPath();

			if ( tabSlug !== listingsSlug ) {
				path = `${ path }/${ tabSlug }`;
			}

			const siteSlug = get( site, 'slug' );

			if ( siteSlug ) {
				path += `/${ siteSlug }`;
			}

			return (
				<SectionNavTabItem
					key={ `wp-job-manager-${ tabSlug }` }
					path={ path }
					selected={ ( activeTab || listingsSlug ) === tabSlug }>
					{ this.getLabel( tabSlug ) }
				</SectionNavTabItem>
			);
		} );
	}

	render() {
		return (
			<SectionNav selectedText="Settings">
				<SectionNavTabs>
					{ this.renderTabItems( this.getTabs() ) }
				</SectionNavTabs>
			</SectionNav>
		);
	}
}

export default localize( Navigation );
