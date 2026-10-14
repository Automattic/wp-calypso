import { createComponentImplementation } from '@a2ui/react/v0_9';
import { CardApi } from '@a2ui/web_core/v0_9';
import { Card, CardBody } from '@wordpress/components';

export default createComponentImplementation(
	{ name: CardApi.name, schema: CardApi.schema.pick( { child: true } ) },
	( { props, buildChild } ) => (
		<Card
			style={ {
				backgroundColor: 'var(--color-background, #fff)',
				color: 'var(--color-foreground, #1e1e1e)',
			} }
		>
			<CardBody>{ buildChild( props.child ) }</CardBody>
		</Card>
	)
);
