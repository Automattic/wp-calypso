/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop, identity } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

class EditorDrawerWell extends Component {
	static propTypes = {
		children: PropTypes.node,
		disabled: PropTypes.bool,
		empty: PropTypes.bool,
		icon: PropTypes.string,
		isHidden: PropTypes.bool,
		label: PropTypes.node,
		onClick: PropTypes.func,
		customDropZone: PropTypes.node,
		translate: PropTypes.func
	};

	static defaultProps = {
		disabled: false,
		isHidden: false,
		onClick: noop,
		translate: identity,
	};

	render() {
		const { empty, onClick, disabled, icon, label, children, isHidden } = this.props;
		const classes = classNames(
			'editor-drawer-well',
			{
				'is-empty': empty,
				'is-hidden': isHidden,
			},
		);

		return (
			<div className={ classes }>
				<div className="editor-drawer-well__content">
					{ children }
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
								className="editor-drawer-well__icon"
							/>
						) }
						<span className="editor-drawer-well__button button is-secondary is-compact">
							{ label }
						</span>
					</button>
				) }
				{ this.props.customDropZone }
			</div>
		);
	}
}

export default localize( EditorDrawerWell );
