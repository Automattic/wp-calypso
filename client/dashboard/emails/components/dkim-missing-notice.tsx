import { titanDkimStatusRecheckMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { ADDING_TITAN_TO_YOUR_SITE } from '@automattic/urls';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useRef, useState } from 'react';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import { DKIM_POLL_TIMEOUT } from '../hooks/use-dkim-record-checks';
import { DnsRecord } from './titan-dns-records';
import type { DkimMissingEntry } from '../hooks/use-dkim-record-checks';

interface DkimRecordCheckProps {
	entry: DkimMissingEntry;
	note: string;
	isChecking: boolean;
	onCheckStart: ( domain: string ) => void;
	onCheckEnd: ( domain: string ) => void;
}

const DkimRecordCheck = ( {
	entry,
	note,
	isChecking,
	onCheckStart,
	onCheckEnd,
}: DkimRecordCheckProps ) => {
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
		<VStack spacing={ 2 }>
			<DnsRecord
				type={ record.type }
				note={ note }
				name={ record.name }
				value={ record.data }
				help={
					showTryLater
						? __(
								'We have not found the record yet. DNS changes can take a few hours to show, so try again later.'
							)
						: undefined
				}
			/>
			<HStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={ handleCheckAgain }
					isBusy={ isChecking }
					disabled={ isChecking }
					accessibleWhenDisabled
				>
					{ __( 'Check again' ) }
				</Button>
			</HStack>
		</VStack>
	);
};

interface DkimMissingNoticeProps {
	entries: DkimMissingEntry[];
	checkingDomains: string[];
	onCheckStart: ( domain: string ) => void;
	onCheckEnd: ( domain: string ) => void;
}

const DkimMissingNotice = ( {
	entries,
	checkingDomains,
	onCheckStart,
	onCheckEnd,
}: DkimMissingNoticeProps ) => {
	const isSingleDomain = entries.length === 1;

	const title = isSingleDomain
		? sprintf(
				/* translators: %s is a domain name */
				__( 'Add the DKIM record for %s' ),
				entries[ 0 ].domain
			)
		: sprintf(
				/* translators: %s is the number of domains */
				_n(
					'Add the DKIM record for %s domain',
					'Add the DKIM records for %s domains',
					entries.length
				),
				formatNumber( entries.length )
			);

	const description = isSingleDomain
		? sprintf(
				/* translators: %s is a domain name */
				__(
					'Mail from %s can go to spam until you add this DKIM record at your DNS host. Your domain uses another DNS host, so we cannot add the record for you. <learnMoreLink>Learn more</learnMoreLink>'
				),
				entries[ 0 ].domain
			)
		: __(
				'Mail from these domains can go to spam until you add their DKIM records at your DNS host. They use another DNS host, so we cannot add the records for you. <learnMoreLink>Learn more</learnMoreLink>'
			);

	return (
		<Notice variant="warning" title={ title }>
			<VStack spacing={ 6 }>
				<Text as="p">
					{ createInterpolateElement( description, {
						learnMoreLink: <ExternalLink href={ ADDING_TITAN_TO_YOUR_SITE } children={ null } />,
					} ) }
				</Text>
				{ entries.map( ( entry ) => (
					<DkimRecordCheck
						key={ entry.domain }
						entry={ entry }
						note={ isSingleDomain ? __( 'DKIM' ) : entry.domain }
						isChecking={ checkingDomains.includes( entry.domain ) }
						onCheckStart={ onCheckStart }
						onCheckEnd={ onCheckEnd }
					/>
				) ) }
			</VStack>
		</Notice>
	);
};

export default DkimMissingNotice;
