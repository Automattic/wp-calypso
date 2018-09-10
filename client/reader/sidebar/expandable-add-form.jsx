/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import GridiconCrossSmall from 'gridicons/dist/cross-small';
import { localize } from 'i18n-calypso';
import { noop, identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import TranslatableString from 'components/translatable/proptype';

export class ExpandableSidebarAddForm extends Component {
	static propTypes = {
		addLabel: TranslatableString,
		addPlaceholder: TranslatableString,
		onAddSubmit: PropTypes.func,
		onAddClick: PropTypes.func,
		hideAddButton: PropTypes.bool,
		translate: PropTypes.func,
	};

	static defaultProps = {
		onAddSubmit: noop,
		onAddClick: noop,
		translate: identity,
	};

	state = {
		isAdding: false,
	};

	menuAddInput = React.createRef();

	toggleAdd = () => {
		if ( ! this.state.isAdding ) {
			this.menuAddInput.current.focus();
			this.props.onAddClick();
		}
		this.setState( { isAdding: ! this.state.isAdding } );
	};

	handleAddKeyDown = event => {
		const inputValue = this.menuAddInput.current.value;
		if ( event.keyCode === 13 && inputValue.length > 0 ) {
			event.preventDefault();
			this.props.onAddSubmit( inputValue );
			this.menuAddInput.current.value = '';
			this.toggleAdd();
		}
	};

	render() {
		const { translate, addLabel, addPlaceholder } = this.props;
		const classes = classNames( 'sidebar__menu-add-item', {
			'is-add-open': this.state.isAdding,
		} );
		return (
			<div className={ classes }>
				{ this.props.hideAddButton ? null : (
					<Button compact className="sidebar__menu-add-button" onClick={ this.toggleAdd }>
						{ translate( 'Add' ) }
					</Button>
				) }
				<div className="sidebar__menu-add">
					<input
						aria-label={ addLabel }
						className="sidebar__menu-add-input"
						type="text"
						placeholder={ addPlaceholder }
						ref={ this.menuAddInput }
						onKeyDown={ this.handleAddKeyDown }
					/>
					<GridiconCrossSmall onClick={ this.toggleAdd } />
				</div>
			</div>
		);
	}
}

export default localize( ExpandableSidebarAddForm );
