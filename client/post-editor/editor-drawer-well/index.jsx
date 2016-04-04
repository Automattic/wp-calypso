/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';

export default React.createClass( {
	displayName: 'EditorDrawerWell',

	propTypes: {
		icon: PropTypes.string,
		label: PropTypes.node,
		empty: PropTypes.bool,
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

	render() {
		const { empty, onRemove, onClick, disabled, icon, label, children } = this.props;
		const classes = classNames( 'editor-drawer-well', {
			'is-empty': empty
		} );

		return (
			<div className={ classes }>
				<div className="editor-drawer-well__content">
					{ children }
					{ onRemove && (
						<Button
							onClick={ onRemove }
							className="editor-drawer-well__remove">
							<span className="screen-reader-text">
								{ this.translate( 'Remove' ) }
							</span>
							<Gridicon
								icon="cross"
								size={ 24 }
								className="editor-drawer-well__remove-icon" />
						</Button>
					) }
				</div>
				{ empty && (
					<button
						type="button"
						onClick={ onClick }
						disabled={ disabled }
						className="editor-drawer-well__placeholder">
						{ icon && (
							<Gridicon
								icon={ icon }
								className="editor-drawer-well__icon" />
						) }
						<span className="editor-drawer-well__button button is-secondary">
							{ label }
						</span>
					</button>
				) }
			</div>
		);
	}
} );
