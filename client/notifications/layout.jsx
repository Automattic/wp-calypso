import React, { Component, PropTypes } from 'react';

import ListViewLayout from './list-view-layout';

export class Layout extends Component {
	render() {
		const {
			notes
		} = this.props;

		return (
			<div className="notifications__layout">
				<ListViewLayout { ...{
					notes,
					selectNote: () => null,
					selectedFilter: 'All',
					updateFilter: () => null
				} } />
			</div>
		);
	}
}

Layout.displayName = 'NotificationsLayout';

Layout.propTypes = {
	notes: PropTypes.array
};

export default Layout;
