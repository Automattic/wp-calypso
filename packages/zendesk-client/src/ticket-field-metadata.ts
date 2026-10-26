/** Zendesk ticket field values by field ID. Empty values are left out. */
export type ZendeskTicketFields = Record<
	string | number,
	string | number | boolean | null | undefined
>;

/**
 * Conversation metadata that sets Zendesk ticket fields when the ticket is created
 * (`zen:ticket_field:<id>`). Empty values are dropped so they don't clear a field.
 */
export function getTicketFieldMetadata( ticketFields: ZendeskTicketFields ) {
	return Object.fromEntries(
		Object.entries( ticketFields )
			.filter( ( [ , value ] ) => value !== undefined && value !== null && value !== '' )
			.map( ( [ id, value ] ) => [ `zen:ticket_field:${ id }`, value ] )
	);
}
