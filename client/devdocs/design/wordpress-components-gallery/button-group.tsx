import { Button, ButtonGroup } from '@wordpress/components';

const ButtonGroupExample = () => {
	const style = { margin: '0 4px' };
	return (
		<ButtonGroup>
			<Button variant="primary" style={ style }>
				Button 1
			</Button>
			<Button variant="primary" style={ style }>
				Button 2
			</Button>
		</ButtonGroup>
	);
};

export default ButtonGroupExample;
