/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import { useRef, useState } from 'react';
import Tooltip from '../';

export default { title: 'packages/components/Tooltip' };

export const Default = () => {
	const [ showTooltip, changeShowTooltip ] = useState( false );
	const triggerRef = useRef( null );

	const toggleTooltip = () => changeShowTooltip( ( show ) => ! show );
	return (
		<div>
			<button onClick={ toggleTooltip }>Toggle Tooltip</button>
			<hr />
			<div ref={ triggerRef }>Tooltip Target</div>
			<Tooltip
				id="tooltip__example"
				isVisible={ showTooltip }
				position="bottom"
				context={ triggerRef.current }
			>
				<p>Tooltip content!</p>
			</Tooltip>
		</div>
	);
};
