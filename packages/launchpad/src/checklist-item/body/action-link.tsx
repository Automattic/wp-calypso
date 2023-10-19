import { Button } from '@wordpress/components';

type ActionLinkProps = {
	label: string;
	href: string;
};

const ActionLink = ( { label, href }: ActionLinkProps ) => {
	return (
		<Button href={ href } variant="primary">
			{ label }
		</Button>
	);
};

export default ActionLink;
