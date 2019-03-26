/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import PostActionsEllipsisMenu from './';
import PostActionsEllipsisMenuEdit from './edit';
import PostActionsEllipsisMenuTrash from './trash';

export class WpBlockActionsEllipsisMenu extends Component {
	static propTypes = {
		globalId: PropTypes.string,
	};

	render() {
		const { globalId } = this.props;

		return (
			<PostActionsEllipsisMenu globalId={ globalId } includeDefaultActions={ false }>
				<PostActionsEllipsisMenuEdit key="edit" />
				<PostActionsEllipsisMenuTrash key="trash" />
			</PostActionsEllipsisMenu>
		);
	}
}

export default WpBlockActionsEllipsisMenu;
