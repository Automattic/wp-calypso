import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DividerApi } from '@a2ui/web_core/v0_9';

export default createComponentImplementation(
	{ name: DividerApi.name, schema: DividerApi.schema.pick( { axis: true } ) },
	( { props } ) => (
		<div
			role="separator"
			aria-orientation={ props.axis ?? 'horizontal' }
			style={ {
				alignSelf: 'stretch',
				borderTop: props.axis === 'vertical' ? undefined : '1px solid #ddd',
				borderLeft: props.axis === 'vertical' ? '1px solid #ddd' : undefined,
			} }
		/>
	)
);
