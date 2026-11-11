import { createComponentImplementation } from '@a2ui/react';
import { z } from 'zod';

export const Divider = createComponentImplementation(
	{
		name: 'Divider',
		schema: z.object( { axis: z.enum( [ 'horizontal', 'vertical' ] ).optional() } ),
	},
	( { props } ) => (
		<div
			role="separator"
			aria-orientation={ props.axis ?? 'horizontal' }
			className="ai-ui-renderer__divider"
		/>
	)
);
