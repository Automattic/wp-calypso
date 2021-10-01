import { Button, ButtonGroup } from '@wordpress/components';
import React from 'react';

const ButtonGroupExample = () => {
	const style = { margin: '0 4px' };
	return (
		<ButtonGroup>
			<Button isPrimary style={ style }>
				Button 1
			</Button>
			<Button isPrimary style={ style }>
				Button 2
			</Button>
		</ButtonGroup>
	);
};

export default ButtonGroupExample;
