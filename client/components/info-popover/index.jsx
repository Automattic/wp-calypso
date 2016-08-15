/**
* External dependencies
*/
import React from 'react';

/**
* Internal dependencies
*/
import Popover from 'components/popover';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import analytics from 'lib/analytics';

export default React.createClass( {

	displayName: 'InfoPopover',

	propTypes: {
		id: React.PropTypes.string,
		position: React.PropTypes.string,
		className: React.PropTypes.string,
		gaEventCategory: React.PropTypes.string,
		popoverName: React.PropTypes.string,
		ignoreContext: React.PropTypes.shape( {
			getDOMNode: React.PropTypes.function
		} ),
	},

	getDefaultProps() {
		return {
			position: 'bottom'
		};
	},

	getInitialState() {
		return {
			showPopover: false
		};
	},

	render() {
		return (
			<span
				onClick={ this._onClick }
				ref="infoPopover"
				className={ classNames(
					'info-popover',
					{ is_active: this.state.showPopover },
					this.props.className )
					}
				>
				<Gridicon icon="info-outline" size={ 18 } />
				<Popover
					id={ this.props.id }
					isVisible={ this.state.showPopover }
					context={ this.refs && this.refs.infoPopover }
					ignoreContext={ this.props.ignoreContext }
					position={ this.props.position }
					onClose={ this._onClose }
					className={ classNames(
							'popover',
							'info-popover__tooltip',
							this.props.className
						) }
					>
						{ this.props.children }
				</Popover>
			</span>
		);
	},

	_onClick( event ) {
		event.preventDefault();
		this.setState( {
			showPopover: ! this.state.showPopover },
			this._recordStats
		);
	},

	_onClose() {
		this.setState( { showPopover: false }, this._recordStats );
	},

	_recordStats() {
		const { gaEventCategory, popoverName } = this.props;

		if ( gaEventCategory && popoverName ) {
			const dialogState = this.state.showPopover ? ' Opened' : ' Closed';
			analytics.ga.recordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + dialogState );
		}
	}
} );
