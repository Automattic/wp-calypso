import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Accordion from 'calypso/components/domains/accordion';
import useDisableDnssecMutation from 'calypso/data/domains/dnssec/use-disable-dnssec-mutation';
import useEnableDnssecMutation from 'calypso/data/domains/dnssec/use-enable-dnssec-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { disableDnssecAction, enableDnssecAction } from 'calypso/state/sites/domains/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `dnssec-notification`,
};

export default function DnssecCard( { domain }: { domain: ResponseDomain } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );

	const [ isUpdating, setIsUpdating ] = useState( false );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ isEnabled, setIsEnabled ] = useState( domain.isDnssecEnabled );
	const [ dnskey, setDnskey ] = useState( domain.dnssecRecords?.dnskey );
	const [ dsData, setDsData ] = useState( domain.dnssecRecords?.dsData );

	const { disableDnssec } = useDisableDnssecMutation( domain.name, {
		onSuccess() {
			setIsUpdating( false );
			setIsEnabled( false );
			dispatch( disableDnssecAction( selectedSiteId, domain.name ) );
		},
		onError( error ) {
			setIsUpdating( false );
			dispatch( errorNotice( error.message, noticeOptions ) );
		},
	} );

	const { enableDnssec } = useEnableDnssecMutation( domain.name, {
		onSuccess( success ) {
			// Key-Systems only returns DS records with digest types 2 and 4, so let's show only those here
			// (a DS record with digest type 1 is also returned by the endpoint)
			const dsRdata = success.data?.cryptokeys?.[ 0 ].ds_data
				?.filter( ( dsData ) => [ 2, 4 ].includes( dsData.digest_type ) )
				.map( ( dsData ) => dsData.rdata );

			const dnssecRecords = {
				dnskey: success.data?.cryptokeys?.[ 0 ].dnskey?.rdata,
				dsData: dsRdata,
			};

			dispatch( enableDnssecAction( selectedSiteId, domain.name, dnssecRecords ) );
			setDnskey( success.data?.cryptokeys?.[ 0 ].dnskey?.rdata );
			setDsData( dsRdata );
			setIsUpdating( false );
			setIsEnabled( true );
		},
		onError( error ) {
			setIsUpdating( false );
			dispatch( errorNotice( error.message, noticeOptions ) );
		},
	} );

	const onToggle = () => {
		setIsUpdating( true );

		recordTracksEvent(
			isEnabled ? 'calypso_domain_dnssec_disabled' : 'calypso_domain_dnssec_enabled',
			{
				domain: domain.name,
			}
		);

		if ( isEnabled ) {
			disableDnssec();
		} else {
			enableDnssec();
		}
	};

	const renderDnskeyRecord = () => {
		if ( ! dnskey ) {
			return null;
		}

		return (
			<fieldset>
				<legend>{ translate( 'DNSKEY' ) }</legend>
				<div className="domain-dnssec-card__record">{ dnskey }</div>
			</fieldset>
		);
	};

	const renderDsRecords = () => {
		if ( ! dsData ) {
			return null;
		}

		return (
			<fieldset>
				<legend>{ translate( 'DS records' ) } </legend>
				{ dsData.map( ( dsRecord ) => {
					return (
						<div key={ dsRecord } className="domain-dnssec-card__record">
							{ dsRecord }
						</div>
					);
				} ) }
			</fieldset>
		);
	};

	const getToggleLabel = () => {
		if ( isUpdating ) {
			return isEnabled ? translate( 'Disabling DNSSEC…' ) : translate( 'Enabling DNSSEC…' );
		}
		return isEnabled ? translate( 'DNSSEC enabled' ) : translate( 'DNSSEC disabled' );
	};

	const renderDnssecCard = () => {
		return (
			<div className="domain-dnssec-card">
				<ToggleControl
					checked={ isEnabled }
					disabled={ isUpdating }
					label={ getToggleLabel() }
					onChange={ onToggle }
				/>
				{ isEnabled && (
					<form>
						{ renderDnskeyRecord() }
						{ renderDsRecords() }
					</form>
				) }
			</div>
		);
	};

	const subtitle = isEnabled
		? translate( 'DNSSEC is enabled for this domain' )
		: translate( 'DNSSEC is disabled for this domain' );

	return (
		<Accordion
			className="domain-dnssec-card__accordion"
			title={ translate( 'DNSSEC' ) }
			subtitle={ subtitle }
			expanded={ isExpanded }
			onOpen={ () => setIsExpanded( true ) }
			onClose={ () => setIsExpanded( false ) }
		>
			{ renderDnssecCard() }
		</Accordion>
	);
}
