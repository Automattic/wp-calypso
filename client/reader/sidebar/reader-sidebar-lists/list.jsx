import PropTypes from 'prop-types';
import { Component } from 'react';
import ListItem from './list-item';
import ListItemCreateLink from './list-item-create-link';

export default class ReaderSidebarListsList extends Component {
	static propTypes = {
		lists: PropTypes.array,
		path: PropTypes.string.isRequired,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
	};

	render() {
		const { lists, currentListOwner, currentListSlug, path } = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<ul className="sidebar__menu-list">
				{ lists.map( ( list ) => (
					<ListItem
						key={ list.ID }
						list={ list }
						path={ path }
						currentListOwner={ currentListOwner }
						currentListSlug={ currentListSlug }
					/>
				) ) }
				<ListItemCreateLink path={ path } />
			</ul>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}
