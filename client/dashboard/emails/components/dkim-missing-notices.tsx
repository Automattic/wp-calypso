import { titanDkimStatusQuery, titanDkimStatusRecheckMutation } from '@automattic/api-queries';
import { ADDING_TITAN_TO_YOUR_SITE } from '@automattic/urls';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { copySmall } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useEffect, useRef, useState } from 'react';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { Notice, NoticeActionButton } from '../../components/notice';
import { Text } from '../../components/text';
import type { TitanDkimRecord, TitanDkimStatus } from '@automattic/api-core';

import './dkim-missing-notices.scss';

export const DKIM_POLL_INTERVAL = 3000;
export const DKIM_POLL_TIMEOUT = 30000;

const DkimRecordValue = ( { value }: { value: string } ) => {
	const [ isCopied, setCopied ] = useState( false );

	useEffect( () => {
		if ( isCopied ) {
			const timerId = window.setTimeout( () => setCopied( false ), 4000 );
			return () => window.clearTimeout( timerId );
		}
	}, [ isCopied ] );

	return (
		<VStack spacing={ 2 }>
			<HStack justify="space-between">
				<Text weight={ 500 }>{ __( 'Value' ) }</Text>
				<Button
					__next40pxDefaultSize
					size="small"
					icon={ copySmall }
					label={
						isCopied
							? __( 'Copied' )
							: sprintf(
									/* translators: %s is the field to copy */
									__( 'Copy %s' ),
									__( 'Value' )
								)
					}
					onClick={ () => {
						navigator.clipboard.writeText( value );
						setCopied( true );
					} }
				/>
			</HStack>
			<code className="dkim-missing-notice__value">{ value }</code>
		</VStack>
	);
};

const DkimRecordFields = ( { record }: { record: TitanDkimRecord } ) => (
	<VStack spacing={ 4 }>
		<div className="dkim-missing-notice__fields">
			<ClipboardInputControl label={ __( 'Name' ) } value={ record.name } readOnly />
			<ClipboardInputControl label={ __( 'Type' ) } value={ record.type } readOnly />
		</div>
		<DkimRecordValue value={ record.data } />
	</VStack>
);

interface DkimMissingNoticeProps {
	entry: TitanDkimStatus & { record: TitanDkimRecord };
	isChecking: boolean;
	onCheckStart: ( domain: string ) => void;
	onCheckEnd: ( domain: string ) => void;
}

const DkimMissingNotice = ( {
	entry,
	isChecking,
	onCheckStart,
	onCheckEnd,
}: DkimMissingNoticeProps ) => {
	const { domain, status, checked_at: checkedAt, record } = entry;
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { mutate: recheck } = useMutation( titanDkimStatusRecheckMutation() );
	const checkedAtBeforeRecheck = useRef< string | null >( null );
	const [ showTryLater, setShowTryLater ] = useState( false );

	const handleCheckAgain = () => {
		checkedAtBeforeRecheck.current = checkedAt;
		setShowTryLater( false );
		onCheckStart( domain );
		recheck( undefined, {
			onError: () => {
				onCheckEnd( domain );
				setShowTryLater( true );
			},
		} );
	};

	useEffect( () => {
		if ( ! isChecking || checkedAt === checkedAtBeforeRecheck.current ) {
			return;
		}
		onCheckEnd( domain );
		if ( status === 'found' ) {
			createSuccessNotice(
				sprintf(
					/* translators: %s is a domain name */
					__( 'We found the DKIM record for %s.' ),
					domain
				),
				{ type: 'snackbar' }
			);
		} else {
			setShowTryLater( true );
		}
	}, [ isChecking, checkedAt, status, domain, onCheckEnd, createSuccessNotice ] );

	useEffect( () => {
		if ( ! isChecking ) {
			return;
		}
		const timerId = window.setTimeout( () => {
			onCheckEnd( domain );
			setShowTryLater( true );
		}, DKIM_POLL_TIMEOUT );
		return () => window.clearTimeout( timerId );
	}, [ isChecking, domain, onCheckEnd ] );

	return (
		<Notice
			variant="warning"
			title={ sprintf(
				/* translators: %s is a domain name */
				__( 'Add the DKIM record for %s' ),
				domain
			) }
			actions={
				<NoticeActionButton
					variant="solid"
					onClick={ handleCheckAgain }
					disabled={ isChecking }
					loading={ isChecking }
				>
					{ __( 'Check again' ) }
				</NoticeActionButton>
			}
		>
			<VStack spacing={ 4 }>
				<Text as="p">
					{ createInterpolateElement(
						sprintf(
							/* translators: %s is a domain name */
							__(
								'Mail from %s can go to spam until you add this DKIM record at your DNS host. Your domain uses another DNS host, so we cannot add the record for you. <learnMoreLink>Learn more</learnMoreLink>'
							),
							domain
						),
						{
							learnMoreLink: <ExternalLink href={ ADDING_TITAN_TO_YOUR_SITE } children={ null } />,
						}
					) }
				</Text>
				<DkimRecordFields record={ record } />
				{ showTryLater && (
					<Text as="p">
						{ __(
							'We have not found the record yet. DNS changes can take a few hours to show, so try again later.'
						) }
					</Text>
				) }
			</VStack>
		</Notice>
	);
};

const hasRecord = (
	entry: TitanDkimStatus
): entry is TitanDkimStatus & { record: TitanDkimRecord } => !! entry.record;

export default function DkimMissingNotices( { enabled }: { enabled: boolean } ) {
	const [ checkingDomains, setCheckingDomains ] = useState< string[] >( [] );
	const { data } = useQuery( {
		...titanDkimStatusQuery(),
		enabled,
		refetchInterval: checkingDomains.length ? DKIM_POLL_INTERVAL : false,
	} );

	const onCheckStart = useCallback( ( domain: string ) => {
		setCheckingDomains( ( domains ) => [ ...domains, domain ] );
	}, [] );

	const onCheckEnd = useCallback( ( domain: string ) => {
		setCheckingDomains( ( domains ) => domains.filter( ( d ) => d !== domain ) );
	}, [] );

	// A domain being rechecked stays rendered so its notice can react to the new result.
	const entries = ( Array.isArray( data ) ? data : [] )
		.filter( hasRecord )
		.filter( ( entry ) => entry.status === 'missing' || checkingDomains.includes( entry.domain ) );

	if ( ! enabled || ! entries.length ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			{ entries.map( ( entry ) => (
				<DkimMissingNotice
					key={ entry.domain }
					entry={ entry }
					isChecking={ checkingDomains.includes( entry.domain ) }
					onCheckStart={ onCheckStart }
					onCheckEnd={ onCheckEnd }
				/>
			) ) }
		</VStack>
	);
}
