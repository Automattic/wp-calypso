import { addEmailForwarder } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

type ResponseError = {
	error:
		| 'destination_failed'
		| 'invalid_input'
		| 'not_valid_destination'
		| 'too_many_destinations'
		| 'exceeded_mailbox_forwards'
		| 'mailbox_too_long'
		| 'not_valid_mailbox'
		| 'empty_destination'
		| 'same_destination_domain'
		| 'forward_exists';
	message:
		| string
		| {
				error_message: string;
				index: number;
		  };
};

type Variables = {
	domain: string;
	mailbox: string;
	destinations: string[];
};

export const addEmailForwarderMutation = () =>
	mutationOptions< unknown, ResponseError, Variables >( {
		mutationFn: ( {
			domain,
			mailbox,
			destinations,
		}: {
			domain: string;
			mailbox: string;
			destinations: string[];
		} ) => addEmailForwarder( domain, mailbox, destinations ),
	} );
