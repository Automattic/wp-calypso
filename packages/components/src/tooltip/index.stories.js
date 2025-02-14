import { useState, useRef } from 'react';
import { Button } from '../button';
import Tooltip from './';

const TooltipWrapper = ( { placement } ) => {
	const [ show, setShow ] = useState( false );
	const handleOpen = () => setShow( true );
	const handleClose = () => setShow( false );
	const tooltipRef = useRef();
	const placements = {
		top: 'top',
		tl: 'top left',
		tr: 'top right',
		left: 'left',
		right: 'right',
		bottom: 'bottom',
		bl: 'bottom left',
		br: 'bottom right',
	};
	const buttonWidth = 80;

	return (
		<>
			<Button
				onMouseEnter={ handleOpen }
				onMouseLeave={ handleClose }
				onClick={ handleClose }
				ref={ tooltipRef }
				style={ { width: buttonWidth, margin: 4, borderRadius: '6px' } }
			>
				{ placement }
			</Button>
			<Tooltip
				position={ placements[ placement.toLowerCase() ] }
				isVisible={ show }
				onClose={ handleClose }
				context={ tooltipRef.current }
			>
				<div>Prompt</div>
			</Tooltip>
		</>
	);
};

export const Default = () => {
	const buttonWidth = 80;
	return (
		<div style={ { padding: '80px' } }>
			<div className="demo">
				<div style={ { marginInlineStart: buttonWidth + 4, whiteSpace: 'nowrap' } }>
					<TooltipWrapper placement="TL" />
					<TooltipWrapper placement="Top" />
					<TooltipWrapper placement="TR" />
				</div>
				<div style={ { width: buttonWidth, float: 'inline-start' } }>
					<TooltipWrapper placement="Left" />
				</div>
				<div style={ { width: buttonWidth, marginInlineStart: buttonWidth * 4 + 24 } }>
					<TooltipWrapper placement="Right" />
				</div>
				<div style={ { marginInlineStart: buttonWidth, clear: 'both', whiteSpace: 'nowrap' } }>
					<TooltipWrapper placement="BL" />
					<TooltipWrapper placement="Bottom" />
					<TooltipWrapper placement="BR" />
				</div>
			</div>
		</div>
	);
};

export default {
	title: 'packages/components/Tooltip',
	component: Tooltip,
};
