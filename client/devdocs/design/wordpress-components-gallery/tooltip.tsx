import { Tooltip } from '@wordpress/components';
import React from 'react';

const TooltipExample = () => (
	<Tooltip text="More information" position="top center">
		<div
			style={ {
				margin: '50px auto',
				width: '200px',
				padding: '20px',
				textAlign: 'center',
				border: '1px solid #ccc',
			} }
		>
			Hover for more information
		</div>
	</Tooltip>
);

export default TooltipExample;
