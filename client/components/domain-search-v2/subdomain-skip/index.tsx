import {
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';

import './style.scss';

const SubdomainSkip = () => {
	return (
		<Card className="subdomain-skip">
			<CardBody>
				<div className="subdomain-skip__content">
					<Heading level="4" weight="normal">
						WordPress.com subdomain
					</Heading>
					<Text>
						thalassolasso.<strong>wordpress.com</strong> is included
					</Text>
				</div>
				<Button className="subdomain-skip__btn" variant="secondary">
					Skip purchase
				</Button>
			</CardBody>
		</Card>
	);
};

export default SubdomainSkip;
