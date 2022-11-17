import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderSidebarTagsListItem from './list-item';

export class ReaderSidebarTagsList extends Component {
	static propTypes = {
		tags: PropTypes.array,
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
	};

	renderItems() {
		const { path, currentTag, tags } = this.props;
		return map( tags, ( tag ) => (
			<ReaderSidebarTagsListItem
				key={ tag.id }
				tag={ tag }
				path={ path }
				currentTag={ currentTag }
			/>
		) );
	}

	render() {
		return <ul>{ this.renderItems() }</ul>;
	}
}

export default localize( ReaderSidebarTagsList );
