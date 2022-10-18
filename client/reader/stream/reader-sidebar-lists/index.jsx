import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderSidebarListsList from './list';

import './style.scss';

export class ReaderSidebarLists extends Component {
	static propTypes = {
		lists: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const { path, ...passedProps } = this.props;
		return (
			<ul>
				<ReaderSidebarListsList path={ path } { ...passedProps } />
			</ul>
		);
	}
}

export default localize( ReaderSidebarLists );
