import { addEmailForwarder } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const addEmailForwarderMutation = () =>
	mutationOptions( {
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
