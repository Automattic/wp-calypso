import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

import HeaderCake from 'components/header-cake';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

import StandardPluginsPanel from './standard-plugins-panel';

export const PluginsList = React.createClass( {
	render() {
		const { siteSlug } = this.props;
		const backHref = `/plugins/${ siteSlug }`;

		return (
			<div className="wpcom-plugin-panel wpcom-plugins-list">
				<HeaderCake backHref={ backHref } onClick={ noop }>Standard Plugins</HeaderCake>
				<StandardPluginsPanel />
			</div>
		);
	}
} );

const mapStateToProps = state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( PluginsList );
