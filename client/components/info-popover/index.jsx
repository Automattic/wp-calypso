/**
* External dependencies
*/
import React from 'react';
import defer from 'lodash/function/defer';
import noop from 'lodash/utility/noop';

/**
* Internal dependencies
*/
import Popover from 'components/popover';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import analytics from 'analytics';

export default React.createClass( {

	displayName: 'InfoPopover',

	propTypes: {
		position: React.PropTypes.string,
		className: React.PropTypes.string,
		gaEventCategory: React.PropTypes.string,
		popoverName: React.PropTypes.string,
		isVisible: React.PropTypes.bool,
		toggle: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			position: 'bottom',
			toggle: noop
		};
	},

	getInitialState() {
		return {
			showPopover: false
		};
	},

	getVisibility() {
		if ( typeof this.props.isVisible === 'undefined' ) {
			return this.state.showPopover;
		}
		return this.props.isVisible;
	},

	render() {
		return (
			<span onClick={ this._onClick } ref="infoPopover" className={ classNames( 'info-popover', { 'is_active': this.state.showPopover }, this.props.className ) }>
				<Gridicon icon="info-outline" size={ 18 } />
				<Popover
					isVisible={ this.getVisibility() }
					context={ this.refs && this.refs.infoPopover }
					position={ this.props.position }
					onClose={ this._onClose }
					className={ classNames( 'popover', 'info-popover__tooltip', this.props.className ) }>
						{ this.props.children }
				</Popover>
			</span>
		);
	},

	_onClick( event ) {
		event.preventDefault();
		this.props.toggle( ! this.getVisibility() );
		this.setState( { showPopover: ! this.state.showPopover }, this._recordStats );
	},

	_onClose() {
		this.setState( { showPopover: false }, this._recordStats );
		defer( () => ( this.props.toggle( false ) ) );
	},

	_recordStats() {
		const { gaEventCategory, popoverName } = this.props;

		if ( gaEventCategory && popoverName ) {
			const dialogState = this.state.showPopover ? ' Opened' : ' Closed';
			analytics.ga.recordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + dialogState );
		}
	}
} );
