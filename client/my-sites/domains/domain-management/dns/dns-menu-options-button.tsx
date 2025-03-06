/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { Icon, moreVertical, redo } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { dnsTemplates } from 'calypso/lib/domains/constants';
import {
	getGoogleMailServiceFamily,
	hasGSuiteWithAnotherProvider,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { applyDnsTemplate, fetchDns, updateDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import RestoreDefaultARecordsDialog from './restore-default-a-records-dialog';
import RestoreDefaultCnameRecordDialog from './restore-default-cname-record-dialog';
import RestoreDefaultEmailRecordsDIalog from './restore-default-email-records-dialog';
import RestoreEmailDnsDialog from './restore-email-dns-dialog';
import type {
	DnsMenuOptionsButtonProps,
	DnsTemplateDetails,
	RestoreDialogResult,
	RestoreEmailDnsDialogResult,
} from './types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

enum EmailProvider {
	GOOGLE = 'GOOGLE',
	TITAN = 'TITAN',
}

type EmailProviderKey = keyof typeof EmailProvider;

type EmailProviderConfiguration = {
	dnsTemplate: DnsTemplateDetails;
	shouldRestoreOptionBeEnabled: ( domain: ResponseDomain ) => boolean;
	providerSlug: string;
	templateVariableBuilder?: () => object;
};

const emailProviderConfig: Record< EmailProviderKey, EmailProviderConfiguration > = {
	GOOGLE: {
		dnsTemplate: dnsTemplates.GMAIL,
		shouldRestoreOptionBeEnabled: ( domain: ResponseDomain ): boolean =>
			( hasGSuiteWithUs( domain ) || hasGSuiteWithAnotherProvider( domain ) ) &&
			false === domain?.googleAppsSubscription?.hasExpectedDnsRecords,
		providerSlug: 'google',
	},
	TITAN: {
		dnsTemplate: dnsTemplates.TITAN,
		shouldRestoreOptionBeEnabled: ( domain: ResponseDomain ): boolean =>
			hasTitanMailWithUs( domain ) &&
			false === domain?.titanMailSubscription?.hasExpectedDnsRecords,
		providerSlug: 'titan',
	},
};

const emailProviderKeys: EmailProviderKey[] = [ EmailProvider.TITAN, EmailProvider.GOOGLE ];

function DnsMenuOptionsButton( {
	domain,
	hasDefaultARecords,
	hasDefaultCnameRecord,
	hasDefaultEmailRecords,
	dns,
	dispatchApplyDnsTemplate,
	dispatchUpdateDns,
	dispatchSuccessNotice,
	dispatchErrorNotice,
}: DnsMenuOptionsButtonProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ emailRestoreDialogVisibility, setEmailRestoreDialogVisibility ] = useState(
		Object.assign(
			{},
			...emailProviderKeys.map( ( emailProviderKey: string ): object => {
				return { [ emailProviderKey ]: false };
			} )
		)
	);
	const [ isRestoreARecordsDialogVisible, setRestoreARecordsDialogVisible ] = useState( false );
	const [ isRestoreCnameRecordDialogVisible, setRestoreCnameRecordDialogVisible ] =
		useState( false );
	const [ isRestoreEmailRecordsDialogVisible, setRestoreEmailRecordsDialogVisible ] =
		useState( false );
	const optionsButtonRef = useRef( null );
	const shouldShowRestoreEmailRecordsMenuOption = domain?.isPrimary && domain?.isMappedToAtomicSite;

	const toggleMenu = useCallback( () => {
		setMenuVisible( ! isMenuVisible );
	}, [ isMenuVisible ] );

	const closeMenu = useCallback( () => setMenuVisible( false ), [] );

	const getARecordsToRemove = useCallback( () => {
		const dnsRecords = dns.records ?? [];

		return dnsRecords.filter(
			( record ) =>
				record.domain === record.name.replace( /\.$/, '' ) &&
				[ 'A', 'AAAA' ].includes( record.type )
		);
	}, [ dns ] );

	const getCnameRecordToRemove = useCallback( () => {
		const dnsRecords = dns.records ?? [];

		return dnsRecords.filter(
			( record ) =>
				record.domain !== record.data?.replace( /\.$/, '' ) &&
				'CNAME' === record.type &&
				'www' === record.name
		);
	}, [ dns ] );

	const domainName = domain?.domain ?? domain?.name;

	const getDefaultCnameRecord = useCallback( () => {
		return [
			{
				type: 'CNAME',
				data: `${ domainName }.`,
				name: 'www',
			},
		];
	}, [ domainName ] );

	const restoreEmailDnsRecords = useCallback(
		async ( {
			dnsTemplate,
			variables,
		}: {
			dnsTemplate: DnsTemplateDetails;
			variables: object;
		} ) => {
			dispatchApplyDnsTemplate( domainName, dnsTemplate.PROVIDER, dnsTemplate.SERVICE, {
				domain: domainName,
				...variables,
			} )
				.then( () =>
					dispatchSuccessNotice( __( 'DNS records for your email service were restored' ) )
				)
				.catch( () =>
					dispatchErrorNotice( __( 'Failed to restore the DNS records for your email service' ) )
				);
		},
		[ dispatchApplyDnsTemplate, dispatchErrorNotice, dispatchSuccessNotice, domainName ]
	);

	const restoreDefaultARecords = useCallback( async () => {
		dispatchUpdateDns( domainName, [], getARecordsToRemove(), true )
			.then( () => dispatchSuccessNotice( __( 'Default A records restored' ) ) )
			.catch( () => dispatchErrorNotice( __( 'Failed to restore the default A records' ) ) );
	}, [
		__,
		dispatchErrorNotice,
		dispatchSuccessNotice,
		dispatchUpdateDns,
		domainName,
		getARecordsToRemove,
	] );

	const restoreDefaultCnameRecord = useCallback( async () => {
		dispatchUpdateDns( domainName, getDefaultCnameRecord(), getCnameRecordToRemove() )
			.then( () => dispatchSuccessNotice( __( 'Default CNAME record restored' ) ) )
			.catch( ( e ) => {
				// The backend error message when there's already an existing record for the `www` subdomain has the format:
				// CNAME www.your-domain.com. conflicts with A www.your-domain.com.
				if ( e.message.match( /^CNAME www\..+ conflicts with .*$/ ) ) {
					return dispatchErrorNotice(
						__(
							'Failed to restore the default CNAME record. Please remove any DNS records you added for the “www” subdomain before restoring the default CNAME record.'
						)
					);
				}

				// Other DNS errors will be presented with a generic error message
				return dispatchErrorNotice( __( 'Failed to restore the default CNAME record' ) );
			} );
	}, [
		__,
		dispatchErrorNotice,
		dispatchSuccessNotice,
		dispatchUpdateDns,
		domainName,
		getDefaultCnameRecord,
		getCnameRecordToRemove,
	] );

	const restoreDefaultEmailRecords = useCallback( async () => {
		wpcom.req
			.post( {
				apiNamespace: 'wpcom/v2',
				path: '/domains/dns/email/set-default-records',
				body: {
					domain: domainName,
				},
			} )
			.then( () => {
				dispatchSuccessNotice( __( 'The default email DNS records were successfully fixed!' ) );
			} )
			.catch( () => {
				dispatchErrorNotice( __( 'There was a problem when restoring default email DNS records' ) );
			} )
			.finally( () => {
				dispatch( fetchDns( domainName, true ) );
			} );
	}, [ __, dispatch, dispatchErrorNotice, dispatchSuccessNotice, domainName ] );

	const closeRestoreARecordsDialog = ( result: RestoreDialogResult ) => {
		setRestoreARecordsDialogVisible( false );
		if ( result?.shouldRestoreDefaultRecords ?? false ) {
			restoreDefaultARecords();
		}
	};

	const closeRestoreCnameRecordDialog = ( result: RestoreDialogResult ) => {
		setRestoreCnameRecordDialogVisible( false );
		if ( result?.shouldRestoreDefaultRecords ?? false ) {
			restoreDefaultCnameRecord();
		}
	};

	const closeRestoreEmailRecordsDialog = ( result: RestoreDialogResult ) => {
		setRestoreEmailRecordsDialogVisible( false );
		if ( result?.shouldRestoreDefaultRecords ?? false ) {
			restoreDefaultEmailRecords();
		}
	};

	const showRestoreARecordsDialog = useCallback(
		() => setRestoreARecordsDialogVisible( true ),
		[]
	);
	const showRestoreCnameRecordDialog = useCallback(
		() => setRestoreCnameRecordDialogVisible( true ),
		[]
	);

	const showRestoreEmailRecordsDialog = useCallback(
		() => setRestoreEmailRecordsDialogVisible( true ),
		[]
	);

	const closeEmailRestoreDialog = ( {
		providerKey,
		shouldRestoreEmailDns,
	}: {
		providerKey: EmailProviderKey;
		shouldRestoreEmailDns: boolean;
	} ) => {
		setEmailRestoreDialogVisibility( { [ providerKey ]: false } );
		if ( shouldRestoreEmailDns ) {
			restoreEmailDnsRecords( {
				dnsTemplate: emailProviderConfig[ providerKey ].dnsTemplate,
				variables: emailProviderConfig[ providerKey ].templateVariableBuilder?.() ?? {},
			} );
		}
	};

	const showEmailRestoreDialog = useCallback(
		( providerKey: string ) => setEmailRestoreDialogVisibility( { [ providerKey ]: true } ),
		[]
	);

	const productNames: Record< EmailProviderKey, string > = {
		GOOGLE: getGoogleMailServiceFamily(),
		TITAN: __( 'Professional Email' ),
	};

	const emailDnsDialogs = emailProviderKeys.map( ( emailProviderKey: EmailProviderKey ) => {
		return (
			<RestoreEmailDnsDialog
				key={ 'email-dns-restore-dialog-' + emailProviderKey }
				emailServiceName={ productNames[ emailProviderKey ] }
				isVisible={ emailRestoreDialogVisibility[ emailProviderKey ] }
				onClose={ ( { shouldRestoreEmailDns }: RestoreEmailDnsDialogResult ) =>
					closeEmailRestoreDialog( { providerKey: emailProviderKey, shouldRestoreEmailDns } )
				}
			/>
		);
	} );

	const emailRestoreItems = emailProviderKeys.map( ( emailProviderKey: EmailProviderKey ) => {
		if (
			domain === undefined ||
			! emailProviderConfig[ emailProviderKey ].shouldRestoreOptionBeEnabled( domain )
		) {
			return null;
		}

		return (
			<PopoverMenuItem
				key={ 'email-dns-restore-menu-item-' + emailProviderKey }
				onClick={ () => showEmailRestoreDialog( emailProviderKey ) }
			>
				<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
				{
					/* translators: %s is an email product name like Professional Email, Google Workspace, or Email Forwarding */
					sprintf( __( 'Restore DNS records for %s' ), productNames[ emailProviderKey ] )
				}
			</PopoverMenuItem>
		);
	} );

	return (
		<>
			<RestoreDefaultARecordsDialog
				visible={ isRestoreARecordsDialogVisible }
				onClose={ closeRestoreARecordsDialog }
				domain={ domain }
			/>

			<RestoreDefaultCnameRecordDialog
				visible={ isRestoreCnameRecordDialogVisible }
				onClose={ closeRestoreCnameRecordDialog }
				domain={ domain }
			/>

			<RestoreDefaultEmailRecordsDIalog
				visible={ isRestoreEmailRecordsDialogVisible }
				onClose={ closeRestoreEmailRecordsDialog }
			/>

			{ emailDnsDialogs }

			<Button
				className="dns__breadcrumb-button ellipsis"
				onClick={ toggleMenu }
				ref={ optionsButtonRef }
				borderless
			>
				<Icon icon={ moreVertical } className="gridicon" />
			</Button>

			<PopoverMenu
				className="dns__breadcrumb-button popover"
				isVisible={ isMenuVisible }
				onClose={ closeMenu }
				context={ optionsButtonRef.current }
				position="bottom"
			>
				<PopoverMenuItem
					onClick={ showRestoreARecordsDialog }
					disabled={ hasDefaultARecords || ! domain }
				>
					<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
					{ __( 'Restore default A records' ) }
				</PopoverMenuItem>

				<PopoverMenuItem
					onClick={ showRestoreCnameRecordDialog }
					disabled={ hasDefaultCnameRecord || ! domain }
				>
					<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
					{ __( 'Restore default CNAME record' ) }
				</PopoverMenuItem>

				{ shouldShowRestoreEmailRecordsMenuOption && (
					<PopoverMenuItem
						onClick={ showRestoreEmailRecordsDialog }
						disabled={ hasDefaultEmailRecords || ! domain }
					>
						<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
						{ __( 'Restore default email records' ) }
					</PopoverMenuItem>
				) }

				{ emailRestoreItems }
			</PopoverMenu>
		</>
	);
}

export default connect( null, {
	dispatchApplyDnsTemplate: applyDnsTemplate,
	dispatchErrorNotice: errorNotice,
	dispatchSuccessNotice: successNotice,
	dispatchUpdateDns: updateDns,
} )( DnsMenuOptionsButton );
