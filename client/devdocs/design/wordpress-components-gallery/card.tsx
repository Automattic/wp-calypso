import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardDivider,
	CardHeader,
	FlexBlock,
	FlexItem,
} from '@wordpress/components';

const CardExample = () => (
	<Card isElevated>
		<CardHeader isShady={ false }>
			<FlexBlock>Header: Code is Poetry</FlexBlock>
			<FlexItem>
				<Button variant="link">Dismiss</Button>
			</FlexItem>
		</CardHeader>

		<CardBody>...</CardBody>

		<CardDivider className="card-example" />

		<CardBody>...</CardBody>

		<CardFooter isShady={ false }>
			<FlexBlock>Footer: Code is Poetry</FlexBlock>
			<FlexItem>
				<Button variant="primary">Action</Button>
			</FlexItem>
		</CardFooter>
	</Card>
);

export default CardExample;
