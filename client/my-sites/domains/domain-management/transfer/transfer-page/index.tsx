import { Button, Card, Spinner } from '@automattic/components';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import { DESIGNATED_AGENT, TRANSFER_DOMAIN_REGISTRATION } from '@automattic/urls';
import { ToggleControl } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, lock } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import moment from 'moment';
import { useState } from 'react';
import { connect } from 'react-redux';
import ActionCard from 'calypso/components/action-card';
import CardHeading from 'calypso/components/card-heading';
import QueryDomainInfo from 'calypso/components/data/query-domain-info';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, getTopLevelOfTld, isMappedDomain } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import AftermarketAutcionNotice from 'calypso/my-sites/domains/domain-management/components/domain/aftermarket-auction-notice';
import HundredYearDomainNotTransferrableNotice from 'calypso/my-sites/domains/domain-management/components/domain/hundred-year-domain-not-transferrable-notice';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import NonTransferrableDomainNotice from 'calypso/my-sites/domains/domain-management/components/domain/non-transferrable-domain-notice';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import SelectIpsTag from 'calypso/my-sites/domains/domain-management/transfer/transfer-out/select-ips-tag';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
	domainManagementTransferToAnyUser,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { useDispatch } from 'calypso/state';
import {
	getDomainLockError,
	getDomainTransferCodeError,
	getNoticeOptions,
} from 'calypso/state/data-layer/wpcom/domains/transfer/notices';
import { updateDomainLock } from 'calypso/state/domains/transfer/actions';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isPrimaryDomainBySiteId from 'calypso/state/selectors/is-primary-domain-by-site-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isSupportSession } from 'calypso/state/support/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TransferUnavailableNotice from '../transfer-unavailable-notice';
import type { TransferPageProps } from './types';
import type { AppState } from 'calypso/types';

import './style.scss';

// The types for ToggleControl are missing `disabled`, but it is listed in the
// component's docs, so we add it here. Please remove all this when the types
// have been fixed.
type ToggleControlProps = React.ComponentProps< typeof ToggleControl > & { disabled?: boolean };
const FixedToggleControl = ( props: ToggleControlProps ) => <ToggleControl { ...props } />;

type ErrResponse = {
	error?: string;
};

const TransferPage = ( props: TransferPageProps ) => {
	const dispatch = useDispatch();
	const {
		canTransferToAnyUser,
		canTransferToOtherSite,
		currentRoute,
		domains,
		isDomainInfoLoading,
		isDomainLocked,
		isDomainOnly,
		isMapping,
		isSupportSession,
		selectedDomainName,
		selectedSite,
	} = props;
	const { __ } = useI18n();
	const [ isRequestingTransferCode, setIsRequestingTransferCode ] = useState( false );
	const [ isLockingOrUnlockingDomain, setIsLockingOrUnlockingDomain ] = useState( false );
	const domain = getSelectedDomain( props );
	const hasEnTranslation = useHasEnTranslation();
	const renderHeader = () => {
		const items = [
			{
				// translators: Internet domains, e.g. mygroovydomain.com
				label: isUnderDomainManagementAll( currentRoute ) ? __( 'All Domains' ) : __( 'Domains' ),
				href: domainManagementList(
					selectedSite?.slug,
					currentRoute,
					selectedSite?.options?.is_domain_only
				),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				// translators: Verb - Transfer a domain somewhere else
				label: __( 'Transfer' ),
			},
		];

		const mobileItem = {
			label: sprintf(
				/* translators: Link to return to the settings management page of a specific domain (%s = domain, e.g. example.com) */
				__( 'Back to %s' ),
				selectedDomainName
			),
			href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return <DomainHeader items={ items } mobileItem={ mobileItem } />;
	};

	const renderTransferOptions = () => {
		const options = [];

		if ( ! isDomainOnly && canTransferToAnyUser ) {
			const mainText = isMapping
				? __( 'Transfer this domain connection to any administrator on this site' )
				: __( 'Transfer this domain to any administrator on this site' );

			options.push(
				<ActionCard
					key="transfer-to-another-user"
					buttonHref={ domainManagementTransferToAnotherUser(
						selectedSite?.slug,
						selectedDomainName,
						currentRoute
					) }
					// translators: Continue is a verb
					buttonText={ __( 'Continue' ) }
					// translators: Transfer a domain to another user
					headerText={ __( 'To another user' ) }
					mainText={ mainText }
				/>
			);
		} else if (
			! [ 'uk', 'fr', 'ca', 'de', 'jp' ].includes( getTopLevelOfTld( selectedDomainName ) ) &&
			canTransferToOtherSite
		) {
			options.push(
				<ActionCard
					key="transfer-to-any-user"
					buttonHref={ domainManagementTransferToAnyUser(
						selectedSite?.slug,
						selectedDomainName,
						currentRoute
					) }
					// translators: Continue is a verb
					buttonText={ __( 'Continue' ) }
					// translators: Transfer a domain to another user
					headerText={ __( 'To another WordPress.com user' ) }
					mainText={ __( 'Transfer this domain to another WordPress.com user' ) }
				/>
			);
		}

		if ( domain?.pendingRegistration || domain?.pendingRegistrationAtRegistry ) {
			return (
				<TransferUnavailableNotice
					message={ __(
						'We are still setting up your domain. You will not be able to transfer it until the registration setup is done.'
					) }
				></TransferUnavailableNotice>
			);
		}

		if ( options.length > 0 ) {
			options.push( <div key="separator" className="transfer-page__item-separator"></div> );
		}
		const mainText = isMapping
			? __( 'Transfer this domain connection to any site you are an administrator on' )
			: __( 'Transfer this domain to any site you are an administrator on' );

		if ( canTransferToOtherSite ) {
			options.push(
				<ActionCard
					key="transfer-to-another-site"
					buttonHref={ domainManagementTransferToOtherSite(
						selectedSite?.slug,
						selectedDomainName,
						currentRoute
					) }
					// translators: Continue is a verb
					buttonText={ __( 'Continue' ) }
					// translators: Transfer a domain to another WordPress.com site
					headerText={ __( 'To another WordPress.com site' ) }
					mainText={ mainText }
				/>
			);
		}

		return options.length > 0 ? <Card>{ options }</Card> : null;
	};

	const toggleDomainLock = async () => {
		setIsLockingOrUnlockingDomain( true );
		const lock = ! isDomainLocked;

		try {
			await wpcom.req.post( `/domains/${ selectedDomainName }/transfer/`, {
				domainStatus: JSON.stringify( {
					command: lock ? 'lock' : 'unlock',
				} ),
			} );

			dispatch( updateDomainLock( selectedDomainName, lock ) );
			dispatch(
				successNotice(
					lock ? __( 'Domain locked successfully!' ) : __( 'Domain unlocked successfully!' ),
					getNoticeOptions( selectedDomainName )
				)
			);
		} catch {
			dispatch( errorNotice( getDomainLockError( lock ), getNoticeOptions( selectedDomainName ) ) );
		} finally {
			setIsLockingOrUnlockingDomain( false );
		}
	};

	const requestTransferCode = async () => {
		setIsRequestingTransferCode( true );

		try {
			await wpcom.req.post( `/domains/${ selectedDomainName }/transfer/`, {
				domainStatus: JSON.stringify( {
					command: 'only-send-code',
				} ),
			} );

			dispatch(
				successNotice(
					__(
						"We have sent the transfer authorization code to the domain registrant's email address. " +
							"If you don't receive the email shortly, please check your spam folder."
					),
					getNoticeOptions( selectedDomainName )
				)
			);
		} catch ( error ) {
			dispatch(
				errorNotice(
					// Note: getDomainTransferCodeError handles undefined error codes.
					getDomainTransferCodeError( ( error as ErrResponse )?.error ),
					getNoticeOptions( selectedDomainName )
				)
			);
		} finally {
			setIsRequestingTransferCode( false );
		}
	};

	const renderTransferLock = () => {
		if ( isDomainInfoLoading ) {
			return <span className="transfer-page__transfer-lock-placeholder"></span>;
		}

		// translators: domain transfer lock
		const disabledLockLabel = __( 'Transfer lock off' );
		// translators: domain transfer lock
		const enabledLockLabel = __( 'Transfer lock on' );

		const label = (
			<span className="transfer-page__transfer-lock-label">
				{ isDomainLocked ? (
					<>
						<Icon icon={ lock } size={ 16 } viewBox="0 0 22 22" />
						{ enabledLockLabel }
					</>
				) : (
					disabledLockLabel
				) }
			</span>
		);

		const disabled = Boolean(
			! domain?.domainLockingAvailable ||
				domain?.transferAwayEligibleAt ||
				isLockingOrUnlockingDomain
		);

		return (
			<>
				<FixedToggleControl
					className="transfer-page__transfer-lock"
					checked={ isDomainLocked }
					disabled={ disabled }
					onChange={ toggleDomainLock }
					label={ label }
				/>
				{ isLockingOrUnlockingDomain && (
					<div className="transfer-page__loader">
						<Spinner size={ 16 } />
						<p>
							{ isDomainLocked
								? __( 'We are unlocking your domain' )
								: __( 'We are locking your domain' ) }
						</p>
					</div>
				) }
			</>
		);
	};

	const renderTransferMessage = () => {
		const registrationDatePlus60Days = moment.utc( domain?.registrationDate ).add( 60, 'days' );
		const supportLink = moment.utc().isAfter( registrationDatePlus60Days )
			? DESIGNATED_AGENT
			: TRANSFER_DOMAIN_REGISTRATION;

		if ( domain?.transferAwayEligibleAt ) {
			return createInterpolateElement(
				sprintf(
					// translators: %s is a date string, e.g. April 1, 2020
					__( 'You can unlock this domain after %s. <a>Why is my domain locked?</a>' ),
					moment( domain.transferAwayEligibleAt ).format( 'LL' )
				),
				{
					a: createElement( 'a', { href: localizeUrl( supportLink ) } ),
				}
			);
		}

		if ( isDomainInfoLoading || domain?.domainLockingAvailable ) {
			return __(
				'We recommend leaving the transfer lock on, unless you want to transfer your domain to another provider.'
			);
		}

		return __( 'This domain cannot be locked.' );
	};

	const renderUkTransferOptions = () => {
		return <SelectIpsTag selectedDomainName={ selectedDomainName } redesign />;
	};

	const renderCommonTldTransferOptions = () => {
		return (
			<>
				<p>{ renderTransferMessage() }</p>
				{ renderTransferLock() }
				{ domain?.authCodeRequired && (
					<Button
						primary={ false }
						busy={ isRequestingTransferCode }
						onClick={ requestTransferCode }
					>
						{ __( 'Get authorization code' ) }
					</Button>
				) }
			</>
		);
	};

	const renderAdvancedTransferOptions = () => {
		if ( isMapping ) {
			return null;
		}

		const topLevelOfTld = getTopLevelOfTld( selectedDomainName );

		return (
			<Card className="transfer-page__advanced-transfer-options">
				<CardHeading size={ 16 }>
					{ hasEnTranslation( 'Transfer to another registrar' )
						? __( 'Transfer to another registrar' )
						: __( 'Advanced Options' ) }
				</CardHeading>
				{ domain?.isGravatarDomain && (
					<InfoNotice
						redesigned
						text={ __(
							'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you transfer this domain to another registrar, you will have to pay the standard price to register another domain for your Gravatar profile.'
						) }
					/>
				) }
				{ topLevelOfTld !== 'uk' ? renderCommonTldTransferOptions() : renderUkTransferOptions() }
			</Card>
		);
	};

	const renderContent = () => {
		if ( ! domain ) {
			return null;
		}

		if ( isSupportSession ) {
			return (
				<Notice
					text={ __(
						'Transfers cannot be initiated in a support session - please ask the user to do it instead.'
					) }
					status="is-warning"
					showDismiss={ false }
				/>
			);
		}

		if ( domain.isHundredYearDomain ) {
			return <HundredYearDomainNotTransferrableNotice />;
		}

		if ( ! domain.currentUserIsOwner ) {
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		if ( domain.aftermarketAuction ) {
			return <AftermarketAutcionNotice domainName={ selectedDomainName } />;
		}

		if ( domain.isRedeemable ) {
			return <NonTransferrableDomainNotice domainName={ selectedDomainName } />;
		}

		return (
			<>
				{ renderTransferOptions() }
				{ renderAdvancedTransferOptions() }
			</>
		);
	};

	return (
		<Main className="transfer-page" wideLayout>
			<QueryDomainInfo domainName={ selectedDomainName } />
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderHeader() }
			<Layout>
				<Column type="main">{ renderContent() }</Column>
				<Column type="sidebar">
					<Card className="transfer-page__help-section-card">
						<p className="transfer-page__help-section-title">{ __( 'How do transfers work?' ) }</p>
						<p className="transfer-page__help-section-text">
							{ __( 'Transferring a domain within WordPress.com is immediate.' ) }
							<br />
							{ createInterpolateElement(
								__(
									'However, transferring a domain to another provider can take five to seven days during which no changes to the domain can be made. Read <a>this important information</a> before starting a transfer.'
								),
								{
									a: createElement( 'a', { href: localizeUrl( TRANSFER_DOMAIN_REGISTRATION ) } ),
								}
							) }
						</p>
					</Card>
				</Column>
			</Layout>
		</Main>
	);
};

const transferPageComponent = connect( ( state: AppState, ownProps: TransferPageProps ) => {
	const domain = getSelectedDomain( ownProps );
	const siteId = getSelectedSiteId( state );
	const domainInfo = getDomainWapiInfoByDomainName( state, ownProps.selectedDomainName );
	return {
		canTransferToAnyUser: domain?.canTransferToAnyUser ?? false,
		canTransferToOtherSite: domain?.canTransferToOtherSite ?? false,
		currentRoute: getCurrentRoute( state ),
		isAtomic: isSiteAutomatedTransfer( state, siteId ) ?? false,
		isDomainInfoLoading: ! domainInfo.hasLoadedFromServer,
		isDomainLocked: domainInfo.data?.locked,
		isDomainOnly: isDomainOnlySite( state, siteId ) ?? false,
		isMapping: Boolean( domain ) && isMappedDomain( domain ),
		isPrimaryDomain: isPrimaryDomainBySiteId( state, siteId, ownProps.selectedDomainName ),
		isSupportSession: isSupportSession( state ),
	};
} )( TransferPage );

export default transferPageComponent;
