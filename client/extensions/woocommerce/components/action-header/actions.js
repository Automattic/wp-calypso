/**
 * External dependencies
 */

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { debounce } from 'lodash';

/**
 * Internal Dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';
import { Button } from '@automattic/components';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';

class ActionButtons extends Component {
	static propTypes = {
		primaryLabel: PropTypes.string,
	};

	state = {
		isDropdown: false,
	};

	componentDidMount() {
		this.setDropdownAfterLayoutFlush();
		window.addEventListener( 'resize', this.setDropdownDebounced );
	}

	componentDidUpdate() {
		this.setDropdownAfterLayoutFlush();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.setDropdownDebounced );
		// cancel the debounced `setDropdown` calls that might be already scheduled.
		// see https://lodash.com/docs/4.17.4#debounce to learn about the `cancel` method.
		this.setDropdownDebounced.cancel();
		this.setDropdownAfterLayoutFlush.cancel();
	}

	setGroupRef = ( group ) => {
		this.navGroup = group;
	};

	render() {
		const buttons = React.Children.map( this.props.children, function ( child, index ) {
			return child && React.cloneElement( child, { ref: 'button-' + index } );
		} );

		const buttonsClassName = classNames( {
			'action-header__actions': true,
			'is-dropdown': this.state.isDropdown,
			'is-open': this.state.isDropdownOpen,
		} );

		return (
			<div className={ buttonsClassName } ref={ this.setGroupRef }>
				<div className="action-header__actions-list">{ buttons }</div>

				{ this.state.isDropdown && this.getDropdown() }
			</div>
		);
	}

	getButtonWidths = () => {
		let totalWidth = 0;

		React.Children.forEach(
			this.props.children,
			function ( child, index ) {
				if ( ! child ) {
					return;
				}
				/* eslint-disable react/no-string-refs */
				const node = ReactDom.findDOMNode( this.refs[ 'button-' + index ] );
				/* eslint-enable react/no-string-refs */

				if ( ! node ) {
					return;
				}

				const buttonWidth = node.offsetWidth;
				totalWidth += buttonWidth;
			}.bind( this )
		);

		this.buttonsWidth = Math.max( totalWidth, this.buttonsWidth || 0 );
	};

	getDropdown = () => {
		const isSingleButton = React.Children.count( this.props.children ) === 1;
		const primaryLabel = this.props.primaryLabel;

		if ( ! primaryLabel || isSingleButton ) {
			return this.props.children;
		}

		const buttons = React.Children.toArray( this.props.children );
		const primary = buttons.pop();
		const dropdownOptions = buttons.map( function ( child, index ) {
			if ( ! child ) {
				return null;
			}
			return (
				<PopoverMenuItem itemComponent={ Button } { ...child.props } key={ index }>
					{ child.props.children }
				</PopoverMenuItem>
			);
		} );

		return (
			<SplitButton
				{ ...primary.props }
				label={ primaryLabel }
				className="action-header__split-button"
				popoverClassName="woocommerce"
				disabled={ false }
				disableMain={ primary.props.disabled }
			>
				{ dropdownOptions }
			</SplitButton>
		);
	};

	setDropdown = () => {
		if ( ! this.navGroup ) {
			return;
		}

		const navGroupWidth = this.navGroup.offsetWidth;

		this.getButtonWidths();
		this.setState( {
			isDropdown: navGroupWidth <= this.buttonsWidth,
		} );
	};

	setDropdownDebounced = debounce( this.setDropdown, 300 );

	// setDropdown reads element sizes from DOM. If called synchronously in the middle of a React
	// update, it causes a synchronous layout reflow, doing the layout two or more times instead
	// of just once after all the DOM writes are finished. Prevent that by scheduling the call
	// just *after* the next layout flush.
	setDropdownAfterLayoutFlush = afterLayoutFlush( this.setDropdown );
}

export default ActionButtons;
