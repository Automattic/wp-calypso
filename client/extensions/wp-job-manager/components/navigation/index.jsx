/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find, flowRight, get, values } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Tabs } from '../../constants';
import SectionNav from 'components/section-nav';
import SectionNavTabItem from 'components/section-nav/item';
import SectionNavTabs from 'components/section-nav/tabs';
import sectionsModule from 'sections';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class Navigation extends Component {
	static propTypes = {
		activeTab: PropTypes.string,
		siteSlug: PropTypes.string,
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
		const { activeTab, siteSlug } = this.props;
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

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteSlug: getSiteSlug( state, siteId ),
		};
	}
);

export default flowRight(
	connectComponent,
	localize,
)( Navigation );
