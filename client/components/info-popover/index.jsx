/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
* Internal dependencies
*/
import Popover from 'components/popover';
import classNames from 'classnames';
import analytics from 'lib/analytics';

export default class InfoPopover extends Component {
	static propTypes = {
		id: PropTypes.string,
		position: PropTypes.string,
		className: PropTypes.string,
		rootClassName: PropTypes.string,
		gaEventCategory: PropTypes.string,
		popoverName: PropTypes.string,
		ignoreContext: PropTypes.shape( {
			getDOMNode: PropTypes.func
		} ),
	};

	static defaultProps = { position: 'bottom' };

	state = { showPopover: false };

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
					rootClassName={ this.props.rootClassName }
				>
					{ this.props.children }
				</Popover>
			</span>
		);
	}

	_onClick = ( event ) => {
		event.preventDefault();
		this.setState( {
			showPopover: ! this.state.showPopover },
			this._recordStats
		);
	}

	_onClose = () => this.setState( { showPopover: false }, this._recordStats );

	_recordStats = () => {
		const { gaEventCategory, popoverName } = this.props;

		if ( gaEventCategory && popoverName ) {
			const dialogState = this.state.showPopover ? ' Opened' : ' Closed';
			analytics.ga.recordEvent( gaEventCategory, 'InfoPopover: ' + popoverName + dialogState );
		}
	}
}
