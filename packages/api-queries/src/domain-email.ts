import { addEmailForwarder, fetchEmailForwarders } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { userMailboxesQuery } from './me-mailboxes';
import { queryClient } from './query-client';

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
	redirectUrl?: string;
};

export const addEmailForwarderMutation = () =>
	mutationOptions< unknown, ResponseError, Variables >( {
		mutationFn: ( {
			domain,
			mailbox,
			destinations,
			redirectUrl,
		}: {
			domain: string;
			mailbox: string;
			destinations: string[];
			redirectUrl?: string;
		} ) => addEmailForwarder( domain, mailbox, destinations, redirectUrl ),
		onSuccess: () => {
			queryClient.resetQueries( userMailboxesQuery() );
			queryClient.invalidateQueries( {
				queryKey: [ 'domains' ],
				predicate: ( query ) =>
					Array.isArray( query.queryKey ) && query.queryKey[ 2 ] === 'email-forwarders',
			} );
		},
	} );

export const emailForwardersQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'email-forwarders' ],
		queryFn: () => fetchEmailForwarders( domainName ),
	} );
