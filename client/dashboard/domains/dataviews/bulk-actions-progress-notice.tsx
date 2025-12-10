import { bulkDomainUpdateStatusQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useLayoutEffect, useState } from 'react';
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
	const [ shouldShowCompleteNotice, setShouldShowCompleteNotice ] = useState( false );

	const { data } = useQuery( {
		...bulkDomainUpdateStatusQuery(),
		refetchInterval: ( query ) => {
			const lastJob = getLastJob( query.state.data );

			return lastJob?.complete ? -1 : 1_000;
		},
		meta: { persist: false },
		staleTime: 0,
		select: ( data ) => getLastJob( data ),
	} );

	useLayoutEffect( () => {
		if ( ! data ) {
			return;
		}

		if ( ! lastId ) {
			setLastId( data.id );
			return;
		}

		if ( lastId !== data.id ) {
			setShouldShowCompleteNotice( true );
		}

		setLastId( data.id );
	}, [ data, lastId ] );

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
				<p>{ __( "This may take a few minutes. This page will refresh once it's complete." ) }</p>
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
				<p>{ __( 'Please try again. If the problem persists, contact support.' ) }</p>
			</Notice>
		);
	}

	const someUpdatesFailed = data.failed.length > 0;

	if ( someUpdatesFailed ) {
		return (
			<Notice
				onClose={ closeNotice }
				variant="warning"
				title={ __( 'Some domain updates were not successful' ) }
			>
				<p>{ __( 'Please try again. If the problem persists, contact support.' ) }</p>
				<p>
					{ __( 'The following domains were not updated:' ) } { data.failed.join( ', ' ) }
				</p>
			</Notice>
		);
	}

	const content =
		data.action === 'set_auto_renew'
			? __( 'Your auto-renewal settings have been updated across all selected domain names.' )
			: __( 'Your contact information has been updated across all selected domain names.' );

	return (
		<Notice onClose={ closeNotice } variant="success" title={ __( 'All updates complete' ) }>
			<p>{ content }</p>
		</Notice>
	);
};
