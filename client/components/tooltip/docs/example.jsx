/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import TooltipComponent from 'calypso/components/tooltip';

class Tooltip extends PureComponent {
	constructor( props ) {
		super( props );

		this.open = this.open.bind( this );
		this.close = this.close.bind( this );
		this.changePosition = this.changePosition.bind( this );

		this.state = {
			position: 'bottom right',
			show: false,
		};
	}

	open() {
		this.setState( { show: true } );
	}

	close() {
		this.setState( { show: false } );
	}

	changePosition( event ) {
		this.setState( { position: event.target.value } );
	}

	render() {
		const size = 30;

		return (
			<div>
				<FormLabel>
					Position
					<FormSelect value={ this.state.position } onChange={ this.changePosition }>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
					</FormSelect>
				</FormLabel>

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
					<TooltipComponent
						id="tooltip__example"
						isVisible={ this.state.show }
						onClose={ this.close }
						position={ this.state.position }
						context={ this.refs && this.refs[ 'tooltip-reference' ] }
					>
						<div style={ { padding: '10px' } }>Simple Tooltip Instance</div>
					</TooltipComponent>
				</div>
			</div>
		);
	}
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;
