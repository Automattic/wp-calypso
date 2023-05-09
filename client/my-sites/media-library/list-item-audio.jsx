import { Component } from 'react';
import ListItemFileDetails from './list-item-file-details';

export default class extends Component {
	static displayName = 'MediaLibraryListItemDocument';

	render() {
		return <ListItemFileDetails { ...this.props } icon="audio" />;
	}
}
