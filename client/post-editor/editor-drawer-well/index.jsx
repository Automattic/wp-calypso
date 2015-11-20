/**
 * External dependencies
 */
import React, { PropTypes } from 'react/addons';
import classNames from 'classnames';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'EditorDrawerWell',

	propTypes: {
		icon: PropTypes.string,
		label: PropTypes.node,
		disabled: PropTypes.bool,
		onClick: PropTypes.func,
		onRemove: PropTypes.func,
		children: PropTypes.node
	},

	getDefaultProps() {
		return {
			disabled: false,
			onClick: noop,
			onRemove: noop
		};
	},

	renderPlaceholder() {
		const { icon, onClick, disabled, label } = this.props;

		let iconElement;
		if ( icon ) {
			iconElement = <Gridicon icon={ icon } className="editor-drawer-well__icon" />;
		}

		return (
			<button type="button" className="editor-drawer-well__placeholder" onClick={ onClick } disabled={ disabled }>
				{ iconElement }
				<span className="editor-drawer-well__button button is-secondary">
					{ label }
				</span>
			</button>
		);
	},

	renderChildren() {
		const { children, onRemove } = this.props;
		let fragments = { children };

		if ( onRemove ) {
			fragments.remove = (
				<button type="button" onClick={ onRemove } className="editor-drawer-well__remove">
					<span className="screen-reader-text">{ this.translate( 'Remove' ) }</span>
					<span className="editor-drawer-well__remove-icon noticon noticon-close-alt" />
				</button>
			);
		}

		return React.addons.createFragment( fragments );
	},

	render() {
		const hasChildren = React.Children.count( this.props.children ) > 0;
		const classes = classNames( 'editor-drawer-well', {
			'is-empty': ! hasChildren
		} );

		return (
			<div className={ classes }>
				{ hasChildren ? this.renderChildren() : this.renderPlaceholder() }
			</div>
		);
	}
} );
