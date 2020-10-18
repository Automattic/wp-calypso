/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ViewersData from 'calypso/components/data/viewers-data';
import Viewers from './viewers';

class ViewersList extends React.PureComponent {
	static displayName = 'ViewersList';

	render() {
		return (
			<ViewersData
				site={ this.props.site }
				siteId={ this.props.site.ID }
				label={ this.props.label }
			>
				<Viewers />
			</ViewersData>
		);
	}
}

export default localize( ViewersList );
