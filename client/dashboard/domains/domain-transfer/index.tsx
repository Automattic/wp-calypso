import { DomainSubtype } from '@automattic/api-core';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ToggleControl,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useLocale } from '../../app/locale';
import { domainQuery } from '../../app/queries/domain';
import { domainLockMutation, domainTransferCodeMutation } from '../../app/queries/domain-transfer';
import { domainRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { formatDate } from '../../utils/datetime';
import { getTopLevelOfTld } from '../../utils/domain';
import InternalTransferOptions from './internal-transfer-options';
import SelectIpsTag from './select-ips-tag';

const TRANSFER_LOCK_GRACE_PERIOD_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export default function DomainTransfer() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const locale = useLocale();
	const { mutate: updateDomainLock, isPending: isUpdatingDomainLock } = useMutation(
		domainLockMutation( domainName )
	);
	const { mutate: requestTransferCode, isPending: isRequestingTransferCode } = useMutation(
		domainTransferCodeMutation( domainName )
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleToggleChange = ( enabled: boolean ) => {
		updateDomainLock( enabled, {
			onSuccess: () => {
				createSuccessNotice(
					enabled ? __( 'Transfer lock enabled.' ) : __( 'Transfer lock disabled.' ),
					{ type: 'snackbar' }
				);
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save transfer lock settings.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const renderTransferInfo = () => {
		return (
			<Notice title={ __( 'How do transfers work?' ) }>
				{ createInterpolateElement(
					__(
						'Transferring a domain within WordPress.com is immediate. However, transferring a domain to another provider can take 5–7 days during which no changes to the domain can be made. Read <link>Transfer a domain to another registrar</link> before starting a transfer.'
					),
					{
						link: <InlineSupportLink supportContext="transfer-domain-to-another-registrar" />,
					}
				) }
			</Notice>
		);
	};

	const renderTransferMessage = () => {
		const registrationDate = new Date( domain.registration_date );
		const today = new Date();
		const registrationDatePlus60Days = new Date(
			registrationDate.getTime() + TRANSFER_LOCK_GRACE_PERIOD_MS
		);

		let message: string | React.ReactElement = __( 'This domain cannot be locked.' );

		if ( domain.domain_locking_available ) {
			message = __(
				'We recommend leaving the transfer lock on, unless you want to transfer your domain to another provider.'
			);
		}

		const supportLink =
			today > registrationDatePlus60Days
				? 'domain-designated-agent'
				: 'transfer-domain-registration';

		if ( domain.transfer_away_eligible_at ) {
			const transferAwayEligibleAt = formatDate(
				new Date( domain.transfer_away_eligible_at ),
				locale
			);

			message = createInterpolateElement(
				// translators: <date> is a date string, <link> is a link to the support page
				__( 'You can unlock this domain after <date/>. <link>Why is my domain locked?</link>' ),
				{
					date: <>{ transferAwayEligibleAt }</>,
					link: <InlineSupportLink supportContext={ supportLink } />,
				}
			);
		}

		return <Text variant="muted">{ message }</Text>;
	};

	const renderTransferLock = () => {
		const disabled = Boolean(
			! domain.domain_locking_available || domain.transfer_away_eligible_at || isUpdatingDomainLock
		);

		return (
			<HStack alignment="left">
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ domain.is_locked ?? false }
					onChange={ ( checked ) => handleToggleChange( checked ) }
					disabled={ disabled }
					label={ domain.is_locked ? __( 'Transfer lock on' ) : __( 'Transfer lock off' ) }
				/>
			</HStack>
		);
	};

	const onRequestTransferCode = () => {
		requestTransferCode( undefined, {
			onSuccess: () => {
				createSuccessNotice(
					__(
						'We have sent the transfer authorization code to the domain registrant’s email address. If you don’t receive the email shortly, please check your spam folder.'
					),
					{ type: 'snackbar' }
				);
			},
			onError: () => {
				// Todo: improve error message
				createErrorNotice( __( 'Failed to send transfer code.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const renderAuthCodeButton = () => {
		return (
			<HStack alignment="left">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={ onRequestTransferCode }
					disabled={ isRequestingTransferCode }
					isBusy={ isRequestingTransferCode }
				>
					{ __( 'Get authorization code' ) }
				</Button>
			</HStack>
		);
	};

	const renderTransferMethod = () => {
		if ( getTopLevelOfTld( domain.domain ) === 'uk' ) {
			return <SelectIpsTag domain={ domainName } isDomainLocked={ domain.is_locked } />;
		}

		return domain.auth_code_required ? renderAuthCodeButton() : null;
	};

	const renderExternalTransferOptions = () => {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						<SectionHeader title={ __( 'Transfer to another registrar' ) } level={ 3 } />
						{ domain.is_gravatar_restricted_domain && (
							<Text>
								{ __(
									'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you transfer this domain to another registrar, you will have to pay the standard price to register another domain for your Gravatar profile.'
								) }
							</Text>
						) }
						<VStack spacing={ 6 }>
							{ renderTransferMessage() }
							{ renderTransferLock() }
							{ renderTransferMethod() }
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		);
	};

	const isDomainTransferable =
		! domain.is_hundred_year_domain &&
		! domain.is_redeemable &&
		! ( domain.pending_registration || domain.pending_registration_at_registry ) &&
		! domain.aftermarket_auction &&
		domain.current_user_is_owner;

	// TO DO: render notices if the domain is not transferable

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Transfer' ) } /> }>
			{ renderTransferInfo() }
			{ isDomainTransferable && <InternalTransferOptions domain={ domain } /> }
			{ isDomainTransferable && domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && (
				<>{ renderExternalTransferOptions() }</>
			) }
		</PageLayout>
	);
}
