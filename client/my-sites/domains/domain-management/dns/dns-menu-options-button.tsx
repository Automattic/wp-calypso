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
import { applyDnsTemplate, updateDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import RestoreDefaultARecordsDialog from './restore-default-a-records-dialog';
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
	pointsToWpcom,
	dns,
	dispatchApplyDnsTemplate,
	dispatchUpdateDns,
	dispatchSuccessNotice,
	dispatchErrorNotice,
}: DnsMenuOptionsButtonProps ): JSX.Element {
	const { __ } = useI18n();

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ emailRestoreDialogVisibility, setEmailRestoreDialogVisibility ] = useState(
		Object.assign(
			{},
			...emailProviderKeys.map( ( emailProviderKey: string ): object => {
				return { [ emailProviderKey ]: false };
			} )
		)
	);
	const [ isRestoreDialogVisible, setRestoreDialogVisible ] = useState( false );
	const optionsButtonRef = useRef( null );

	const toggleMenu = useCallback( () => {
		setMenuVisible( ! isMenuVisible );
	}, [ isMenuVisible ] );

	const closeMenu = useCallback( () => setMenuVisible( false ), [] );

	const getRecordsToRemove = useCallback( () => {
		const dnsRecords = dns.records ?? [];

		return dnsRecords.filter(
			( record ) =>
				record.domain === record.name.replace( /\.$/, '' ) &&
				[ 'A', 'AAAA' ].includes( record.type )
		);
	}, [ dns ] );

	const domainName = domain?.domain ?? domain?.name;

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

	const restoreDefaultRecords = useCallback( async () => {
		dispatchUpdateDns( domainName, [], getRecordsToRemove() )
			.then( () => dispatchSuccessNotice( __( 'Default A records restored' ) ) )
			.catch( () => dispatchErrorNotice( __( 'Failed to restore the default A records' ) ) );
	}, [
		__,
		dispatchErrorNotice,
		dispatchSuccessNotice,
		dispatchUpdateDns,
		domainName,
		getRecordsToRemove,
	] );

	const closeRestoreDialog = ( result: RestoreDialogResult ) => {
		setRestoreDialogVisible( false );
		if ( result?.shouldRestoreDefaultRecords ?? false ) {
			restoreDefaultRecords();
		}
	};

	const showRestoreDialog = useCallback( () => setRestoreDialogVisible( true ), [] );

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
		( providerKey ) => setEmailRestoreDialogVisibility( { [ providerKey ]: true } ),
		[]
	);

	const productNames: Record< EmailProviderKey, string > = {
		GOOGLE: getGoogleMailServiceFamily(),
		TITAN: __( 'Professional Email' ),
	};

	const emailDnsDialogs = emailProviderKeys.map(
		( emailProviderKey: EmailProviderKey ): JSX.Element => {
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
		}
	);

	const emailRestoreItems = emailProviderKeys.map(
		( emailProviderKey: EmailProviderKey ): JSX.Element | null => {
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
		}
	);

	return (
		<>
			<RestoreDefaultARecordsDialog
				visible={ isRestoreDialogVisible }
				onClose={ closeRestoreDialog }
				defaultRecords={ null }
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
				<PopoverMenuItem onClick={ showRestoreDialog } disabled={ pointsToWpcom || ! domain }>
					<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
					{ __( 'Restore default A records' ) }
				</PopoverMenuItem>

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
