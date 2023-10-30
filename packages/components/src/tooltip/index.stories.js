import { useState, useRef } from 'react';
import Tooltip from './';

export const Default = ( { position } ) => {
	const tooltipRef = useRef();
	const [ show, setShow ] = useState( false );

	const handleOpen = () => {
		setShow( true );
	};

	const handleClose = () => {
		setShow( false );
	};

	const size = 30;
	return (
		<div>
			<div style={ { padding: '150px' } }>
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
					onMouseEnter={ handleOpen }
					onMouseLeave={ handleClose }
					onClick={ handleClose }
					ref={ tooltipRef }
				>
					T
				</span>
				<Tooltip
					id="tooltip__example"
					isVisible={ show }
					onClose={ handleClose }
					position={ position }
					context={ tooltipRef.current }
				>
					<div style={ { padding: '10px' } }>Simple Tooltip Instance</div>
				</Tooltip>
			</div>
		</div>
	);
};

export default {
	title: 'packages/components/Tooltip',
	component: Tooltip,
	argTypes: {
		position: {
			options: [
				'top',
				'top left',
				'top right',
				'left',
				'right',
				'bottom',
				'bottom left',
				'bottom right',
			],
			control: { type: 'radio' },
		},
	},
};
