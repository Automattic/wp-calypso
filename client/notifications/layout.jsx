import React, { Component, PropTypes } from 'react';

import ListViewLayout from './list-view-layout';
import SingleViewLayout from './single-view-layout';

export class Layout extends Component {
	render() {
		const {
			notes,
			note,
			selectNote,
			unselectNote
		} = this.props;

		return (
			<div className="notifications__layout">
				{ note &&
					<SingleViewLayout { ...{
						note,
						unselectNote
					} } />
				}
				{ ! note &&
					<ListViewLayout { ...{
						notes,
						selectNote,
						selectedFilter: 'All',
						updateFilter: () => null
					} } />
				}
			</div>
		);
	}
}

Layout.displayName = 'NotificationsLayout';

Layout.propTypes = {
	notes: PropTypes.array
};

export default Layout;
