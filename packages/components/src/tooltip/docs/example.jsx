/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { PureComponent, createRef } from 'react';
import TooltipComponent from '../';
import { FormLabel } from '../../forms';

class Tooltip extends PureComponent {
	tooltipRef = createRef();
	state = {
		position: 'bottom right',
		show: false,
	};

	open = () => {
		this.setState( { show: true } );
	};

	close = () => {
		this.setState( { show: false } );
	};

	changePosition = ( event ) => {
		this.setState( { position: event.target.value } );
	};

	render() {
		const size = 30;

		return (
			<div>
				<FormLabel>
					Position
					<select value={ this.state.position } onChange={ this.changePosition }>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
					</select>
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
						ref={ this.tooltipRef }
					>
						T
					</span>
					<TooltipComponent
						id="tooltip__example"
						isVisible={ this.state.show }
						onClose={ this.close }
						position={ this.state.position }
						context={ this.tooltipRef.current }
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
