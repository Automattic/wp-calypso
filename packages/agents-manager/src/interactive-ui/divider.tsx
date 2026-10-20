import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DividerApi } from '@a2ui/web_core/v0_9';

export default createComponentImplementation(
	{ name: DividerApi.name, schema: DividerApi.schema.pick( { axis: true } ) },
	( { props } ) => (
		<div
			role="separator"
			aria-orientation={ props.axis ?? 'horizontal' }
			className="agents-manager-interactive-ui__divider"
		/>
	)
);
