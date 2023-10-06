import { Button } from '@wordpress/components';

type BodyButtonProps = {
	label: string;
	href: string;
};

const BodyButton = ( { label, href }: BodyButtonProps ) => {
	return (
		<Button href={ href } variant="primary">
			{ label }
		</Button>
	);
};

export default BodyButton;
