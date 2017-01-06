/**
 * External dependencies
 */
import React, { PropTypes, Children, cloneElement } from 'react';
import PureComponent from 'react-pure-render/component';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import PostActionsEllipsisMenuEdit from './edit';
import PostActionsEllipsisMenuStats from './stats';
import PostActionsEllipsisMenuPublish from './publish';
import PostActionsEllipsisMenuTrash from './trash';
import PostActionsEllipsisMenuView from './view';
import PostActionsEllipsisMenuRestore from './restore';

export default class PostActionsEllipsisMenu extends PureComponent {
	static propTypes = {
		globalId: PropTypes.string,
		includeDefaultActions: PropTypes.bool,
		children: PropTypes.node
	};

	static defaultProps = {
		includeDefaultActions: true
	};

	constructor() {
		super( ...arguments );

		this.renderChildren = this.renderChildren.bind( this );
	}

	renderChildren() {
		const { globalId, includeDefaultActions } = this.props;
		let { children } = this.props;
		let actions = [];

		if ( includeDefaultActions ) {
			actions.push(
				<PostActionsEllipsisMenuEdit key="edit" />,
				<PostActionsEllipsisMenuView key="view" />,
				<PostActionsEllipsisMenuStats key="stats" />,
				<PostActionsEllipsisMenuPublish key="publish" />,
				<PostActionsEllipsisMenuRestore key="restore" />,
				<PostActionsEllipsisMenuTrash key="trash" />
			);
		}

		children = Children.toArray( children );
		if ( children.length ) {
			if ( actions.length ) {
				actions.push( <PopoverMenuSeparator key="separator" /> );
			}

			actions = actions.concat( children );
		}

		return actions.map( ( action ) => cloneElement( action, { globalId } ) );
	}

	render() {
		return (
			<div className="post-actions-ellipsis-menu">
				<EllipsisMenu position="bottom left" disabled={ ! this.props.globalId }>
					{ this.renderChildren }
				</EllipsisMenu>
			</div>
		);
	}
}
