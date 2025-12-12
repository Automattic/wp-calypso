import { bulkDomainUpdateStatusQuery, domainsQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { Notice } from '../../components/notice';
import type { BulkDomainUpdateStatusQueryFnData } from '@automattic/api-core';

const getLastJob = ( data: BulkDomainUpdateStatusQueryFnData | undefined ) => {
	if ( ! data ) {
		return undefined;
	}

	return bulkDomainUpdateStatusQuery()
		.select?.( data )
		.allJobs.sort( ( a, b ) => b.created_at - a.created_at )
		.at( 0 );
};

export const BulkActionsProgressNotice = () => {
	const [ lastId, setLastId ] = useState( '' );
	const queryClient = useQueryClient();
	const [ shouldShowCompleteNotice, setShouldShowCompleteNotice ] = useState( false );

	const { data } = useQuery( {
		...bulkDomainUpdateStatusQuery(),
		refetchInterval: ( query ) => {
			const lastJob = getLastJob( query.state.data );

			return lastJob?.complete ? false : 1_000;
		},
		meta: { persist: false },
		staleTime: 0,
		select: ( data ) => getLastJob( data ),
	} );

	useEffect( () => {
		if ( ! data ) {
			return;
		}

		setLastId( ( prevId ) => {
			if ( ! prevId ) {
				return data.id;
			}

			if ( prevId !== data.id ) {
				setShouldShowCompleteNotice( true );
			}

			return data.id;
		} );
	}, [ data ] );

	const shouldRefetchAllDomainsQuery = data?.complete && shouldShowCompleteNotice;

	useEffect( () => {
		if ( shouldRefetchAllDomainsQuery ) {
			queryClient.refetchQueries( domainsQuery() );
		}
	}, [ shouldRefetchAllDomainsQuery, queryClient ] );

	if ( ! data ) {
		return null;
	}

	if ( ! data.complete ) {
		const title =
			data.action === 'set_auto_renew'
				? __( 'Updating auto-renewal settings' )
				: __( 'Updating your contact information' );

		return (
			<Notice variant="warning" title={ title }>
				{ __( "This may take a few minutes. This page will refresh once it's complete." ) }
			</Notice>
		);
	}

	if ( ! lastId || ! shouldShowCompleteNotice ) {
		return null;
	}

	const closeNotice = () => {
		setShouldShowCompleteNotice( false );
	};

	const allUpdatesFailed = data.success.length === 0;

	if ( allUpdatesFailed ) {
		return (
			<Notice onClose={ closeNotice } variant="error" title={ __( 'Domain updates failed' ) }>
				{ __( 'Please try again. If the problem persists, contact support.' ) }
			</Notice>
		);
	}

	const someUpdatesFailed = data.failed.length > 0;

	if ( someUpdatesFailed ) {
		// translators: %(domains)s is the list of failed domains
		const title = _n(
			'The following domain was not updated: %(domains)s',
			'The following domains were not updated: %(domains)s',
			data.failed.length
		);

		return (
			<Notice
				onClose={ closeNotice }
				variant="warning"
				title={ __( 'Some domain updates were not successful' ) }
			>
				<p>{ __( 'Please try again. If the problem persists, contact support.' ) }</p>
				<span>{ sprintf( title, { domains: data.failed.join( ', ' ) } ) }</span>
			</Notice>
		);
	}

	const content =
		data.action === 'set_auto_renew'
			? __( 'Your auto-renewal settings have been updated across all selected domain names.' )
			: __( 'Your contact information has been updated across all selected domain names.' );

	return (
		<Notice onClose={ closeNotice } variant="success" title={ __( 'All updates complete' ) }>
			{ content }
		</Notice>
	);
};
