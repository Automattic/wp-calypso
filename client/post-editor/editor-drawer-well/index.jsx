/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { noop, identity } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import DropZone from 'components/drop-zone';

class EditorDrawerWell extends Component {
	static propTypes = {
		children: PropTypes.node,
		disabled: PropTypes.bool,
		empty: PropTypes.bool,
		icon: PropTypes.string,
		label: PropTypes.node,
		onClick: PropTypes.func,
		onFileDrop: PropTypes.func,
		onRemove: PropTypes.func,
		translate: PropTypes.func
	};

	static defaultProps = {
		disabled: false,
		onClick: noop,
		onRemove: noop,
		translate: identity,
	};

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
							compact
							className="editor-drawer-well__remove">
							<span className="screen-reader-text">
								{ this.props.translate( 'Remove' ) }
							</span>
							<Gridicon
								icon="cross"
								size={ 24 }
								className="editor-drawer-well__remove-icon"
							/>
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
								className="editor-drawer-well__icon"
							/>
						) }
						<span className="editor-drawer-well__button button is-secondary is-compact">
							{ label }
						</span>
					</button>
				) }
				{ this.props.onFileDrop
					? <DropZone onFilesDrop={ this.props.onFileDrop } />
					: null
				}
			</div>
		);
	}
}

export default localize( EditorDrawerWell );
