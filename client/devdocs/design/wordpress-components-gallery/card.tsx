/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
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
				<Button isLink>Dismiss</Button>
			</FlexItem>
		</CardHeader>

		<CardBody>...</CardBody>
		<CardDivider />
		<CardBody>...</CardBody>

		<CardFooter isShady={ false }>
			<FlexBlock>Footer: Code is Poetry</FlexBlock>
			<FlexItem>
				<Button isPrimary>Action</Button>
			</FlexItem>
		</CardFooter>
	</Card>
);

export default CardExample;
