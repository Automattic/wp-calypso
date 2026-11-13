import { isWpError } from '@automattic/api-core';
import { domainQuery, titanDkimRecordQuery } from '@automattic/api-queries';
import { ADDING_TITAN_TO_YOUR_SITE } from '@automattic/urls';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { Text } from '../../components/text';

import './titan-dns-records.scss';

interface DnsRecordProps {
	type: string;
	note: string;
	name: string;
	value: string;
	help?: string;
}

const DnsRecord = ( { type, note, name, value, help }: DnsRecordProps ) => (
	<VStack spacing={ 2 }>
		<HStack spacing={ 2 } justify="flex-start">
			<Text weight={ 500 }>{ type }</Text>
			<Text variant="muted">{ note }</Text>
		</HStack>
		<div className="titan-dns-records__fields">
			<ClipboardInputControl label={ __( 'Name' ) } value={ name } readOnly />
			<ClipboardInputControl label={ __( 'Value' ) } value={ value } help={ help } readOnly />
		</div>
	</VStack>
);

const DkimRecord = ( { domain }: { domain: string } ) => {
	const { data, error, isLoading } = useQuery( titanDkimRecordQuery( domain ) );

	if ( isWpError( error ) && [ 401, 403 ].includes( error.statusCode ) ) {
		return null;
	}

	let help;
	if ( isLoading ) {
		help = __( 'Loading the DKIM record.' );
	} else if ( ! data ) {
		help = __( 'We couldn’t load the DKIM record. Try again later.' );
	}

	return (
		<DnsRecord
			type="TXT"
			note={ __( 'DKIM' ) }
			name={ data?.name ?? '' }
			value={ data?.data ?? '' }
			help={ help }
		/>
	);
};

export default function TitanDnsRecords( { domain }: { domain: string } ) {
	const { data: domainData, isLoading } = useQuery( domainQuery( domain ) );

	if ( isLoading ) {
		return <Spinner />;
	}

	if ( domainData?.has_wpcom_nameservers ) {
		return (
			<Text as="p">
				{ __(
					'Your domain uses WordPress.com name servers, so the email DNS records are already set up for you.'
				) }
			</Text>
		);
	}

	/* translators: %d is the priority of an MX DNS record */
	const priorityNote = __( 'Priority %d' );

	return (
		<VStack spacing={ 6 }>
			<Text as="p">
				{ createInterpolateElement(
					__(
						'Your domain uses external name servers. To send and receive Professional Email, add these MX, SPF and DKIM records at your DNS provider. <learnMoreLink>Learn more</learnMoreLink>'
					),
					{
						learnMoreLink: <ExternalLink href={ ADDING_TITAN_TO_YOUR_SITE } children={ null } />,
					}
				) }
			</Text>
			<DnsRecord
				type="MX"
				note={ sprintf( priorityNote, 10 ) }
				name={ domain }
				value="mx1.titan.email"
			/>
			<DnsRecord
				type="MX"
				note={ sprintf( priorityNote, 20 ) }
				name={ domain }
				value="mx2.titan.email"
			/>
			<DnsRecord
				type="TXT"
				note={ __( 'SPF' ) }
				name={ domain }
				value="v=spf1 include:spf.titan.email ~all"
			/>
			<DkimRecord domain={ domain } />
		</VStack>
	);
}
