import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Card as GutenbergCard, CardBody } from '@wordpress/components';
import { z } from 'zod';

export const Card = createComponentImplementation(
	{ name: 'Card', schema: z.object( { child: ComponentIdSchema } ) },
	( { props, buildChild } ) => (
		<GutenbergCard className="ai-ui-renderer__card">
			<CardBody>{ buildChild( props.child ) }</CardBody>
		</GutenbergCard>
	)
);
