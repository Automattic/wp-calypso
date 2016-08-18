
/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';

const TooltipInstance = React.createClass( {
	mixins: [ PureRenderMixin ],

	componentWillMount() {
		this.changePosition = this.changePosition.bind( this );
	},

	getInitialState: function() {
		return {
			position: 'bottom right',
			show: false,
		};
	},

	open() {
		this.setState( { show: true } );
	},

	close() {
		this.setState( { show: false } );
	},

	changePosition( event ) {
		this.setState( { position: event.target.value } );
	},

	render() {
		const size = 30;

		return (
			<div className="docs__design-assets-group">
				<h2>
					<a href="/devdocs/design/tooltip-instance">Tooltip</a>
				</h2>

				<label>Position
					<select
						value={ this.state.position }
						onChange={ this.changePosition }
					>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
					</select>
				</label>

				<hr />

				<div>
					Tooltip context&nbsp;
					<span
						style={ {
							width: size,
							height: size,
							lineHeight: `${ size }px`,
							display: 'inline-block',
							borderRadius: parseInt( size / 2 ),
							backgroundColor: '#444',
							color: 'white',
							fontSize: '12px',
							cursor: 'pointer',
							textAlign: 'center',
						} }
						onMouseEnter={ this.open }
						onMouseLeave={ this.close }
						onClick={ this.close }
						ref="tooltip-reference"
					>
						T
					</span>

					<Tooltip
						id="tooltip__example"
						isVisible={ this.state.show }
						onClose={ this.close }
						position={ this.state.position }
						context={ this.refs && this.refs[ 'tooltip-reference' ] }
					>
						<div style={ { padding: '10px' } }>
							Simple Tooltip Instance
						</div>
					</Tooltip>
				</div>
			</div>
		);
	}
} );

export default TooltipInstance;
