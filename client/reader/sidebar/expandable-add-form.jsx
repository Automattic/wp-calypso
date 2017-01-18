/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { noop, identity } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import Button from 'components/button';

export class ExpandableSidebarAddForm extends Component {
	static propTypes = {
		addLabel: PropTypes.string,
		addPlaceholder: PropTypes.string,
		onAddSubmit: PropTypes.func,
		onAddClick: PropTypes.func,
		hideAddButton: PropTypes.bool,
		translate: PropTypes.func,
	}

	static defaultProps = {
		onAddSubmit: noop,
		onAddClick: noop,
		translate: identity,
	}

	state = {
		isAdding: false,
	}

	toggleAdd = () => {
		if ( ! this.state.isAdding ) {
			this.refs.menuAddInput.focus();
			this.props.onAddClick();
		}
		this.setState( { isAdding: ! this.state.isAdding } );
	}

	handleAddKeyDown = ( event ) => {
		const inputValue = this.refs.menuAddInput.value;
		if ( event.keyCode === 13 && inputValue.length > 0 ) {
			event.preventDefault();
			this.props.onAddSubmit( inputValue );
			this.refs.menuAddInput.value = '';
			this.toggleAdd();
		}
	}

	render() {
		const { translate, addLabel, addPlaceholder } = this.props;
		const classes = classNames(
			'sidebar__menu-add-item',
			{
				'is-add-open': this.state.isAdding
			}
		);
		return (
			<div className={ classes }>
				{ this.props.hideAddButton
					? null
					: <Button compact className="sidebar__menu-add-button" onClick={ this.toggleAdd }>{ translate( 'Add' ) }</Button>
				}
				<div className="sidebar__menu-add">
					<input
						aria-label={ addLabel }
						className="sidebar__menu-add-input"
						type="text"
						placeholder={ addPlaceholder }
						ref="menuAddInput"
						onKeyDown={ this.handleAddKeyDown }
					/>
					<Gridicon icon="cross-small" onClick={ this.toggleAdd } />
				</div>
			</div>
		);
	}
}

export default localize( ExpandableSidebarAddForm );
