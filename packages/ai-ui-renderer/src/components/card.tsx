import { createComponentImplementation } from '@a2ui/react';
import { ComponentIdSchema } from '@a2ui/web_core/v1_0';
import { Card as WordPressCard } from '@wordpress/ui';
import { z } from 'zod';

export const Card = createComponentImplementation(
	{ name: 'Card', schema: z.object( { child: ComponentIdSchema } ) },
	( { props, buildChild } ) => (
		<WordPressCard.Root className="ai-ui-renderer__card">
			<WordPressCard.Content>{ buildChild( props.child ) }</WordPressCard.Content>
		</WordPressCard.Root>
	)
);
