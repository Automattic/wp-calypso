// Compatibility wrapper - forwards to new implementation
import { renderFormattedContent } from 'calypso/dashboard/components/logs-activity-formatted-block';

/**
 * Legacy FormattedBlock component
 * Now wraps the new implementation for backward compatibility
 */
const FormattedBlock = ( { content, onClick = null, meta = {} } ) => {
	if ( typeof content === 'string' ) {
		return <>{ content }</>;
	}

	const items = Array.isArray( content ) ? content : [ content ];
	const rendered = renderFormattedContent( { items, onClick, meta } );

	return <>{ rendered }</>;
};

export default FormattedBlock;
