import React, { Component, PropTypes } from 'react';

import ListViewLayout from './list-view-layout';
import SingleViewLayout from './single-view-layout';

export class Layout extends Component {
	render() {
		const {
			notes,
			note,
			selectNote,
			unselectNote,
			selectedFilter,
			selectFilter
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
						selectedFilter,
						selectFilter
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
