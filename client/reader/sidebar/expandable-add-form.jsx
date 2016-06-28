/**
 * External Dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';

const ExpandableSidebarAddForm = React.createClass( {

	propTypes: {
		addLabel: React.PropTypes.string,
		addPlaceholder: React.PropTypes.string,
		onAddSubmit: React.PropTypes.func,
		onAddClick: React.PropTypes.func
	},

	getInitialState() {
		return {
			isAdding: false
		};
	},

	getDefaultProps() {
		return {
			onAddSubmit: noop,
			onAddClick: noop
		};
	},

	toggleAdd() {
		if ( ! this.state.isAdding ) {
			this.refs.menuAddInput.focus();
			this.props.onAddClick();
		}
		this.setState( { isAdding: ! this.state.isAdding } );
	},

	handleAddKeyDown( event ) {
		const inputValue = this.refs.menuAddInput.value;
		if ( event.keyCode === 13 && inputValue.length > 0 ) {
			event.preventDefault();
			this.props.onAddSubmit( inputValue );
			this.refs.menuAddInput.value = '';
			this.toggleAdd();
		}
	},

	render() {
		const classes = classNames(
			'sidebar__menu-add-item',
			{
				'is-add-open': this.state.isAdding
			}
		);

		return (
			<div className={ classes }>
				<Button compact className="sidebar__menu-add-button" onClick={ this.toggleAdd }>{ this.translate( 'Add' ) }</Button>

				<div className="sidebar__menu-add">
					<input
						aria-label={ this.props.addLabel }
						className="sidebar__menu-add-input"
						type="text"
						placeholder={ this.props.addPlaceholder }
						ref="menuAddInput"
						onKeyDown={ this.handleAddKeyDown }
					/>
					<Gridicon icon="cross-small" onClick={ this.toggleAdd } />
				</div>
			</div>
		);
	}
} );

export default ExpandableSidebarAddForm;
