import { FormInputValidation, FormLabel, Gridicon, Card } from '@automattic/components';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import useDomainTransferRequestDelete from 'calypso/data/domains/transfers/use-domain-transfer-request-delete';
import useDomainTransferRequestQuery from 'calypso/data/domains/transfers/use-domain-transfer-request-query';
import useDomainTransferRequestUpdate from 'calypso/data/domains/transfers/use-domain-transfer-request-update';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import AftermarketAutcionNotice from 'calypso/my-sites/domains/domain-management/components/domain/aftermarket-auction-notice';
import HundredYearDomainNotTransferrableNotice from 'calypso/my-sites/domains/domain-management/components/domain/hundred-year-domain-not-transferrable-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import NonTransferrableDomainNotice from 'calypso/my-sites/domains/domain-management/components/domain/non-transferrable-domain-notice';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransfer,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import TransferUnavailableNotice from '../transfer-unavailable-notice';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const noticeOptions = {
	duration: 5000,
};

export default function TransferDomainToAnyUser( {
	domains,
	hasSiteDomainsLoaded,
	isRequestingSiteDomains,
	selectedDomainName,
	selectedSite,
}: {
	domains: null | ResponseDomain[];
	hasSiteDomainsLoaded: boolean;
	isRequestingSiteDomains: boolean;
	selectedDomainName: string;
	selectedSite: any;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const currentRoute = useSelector( getCurrentRoute );

	const { data, isLoading } = useDomainTransferRequestQuery(
		selectedSite.slug,
		selectedDomainName
	);
	const transferEmail = data?.email ?? false;

	const expiresAt = new Date( data?.requested_at || '' );
	expiresAt.setHours( expiresAt.getHours() + 24 );

	const [ email, setEmail ] = useState( '' );
	const [ isValidEmail, setIsValidEmail ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const { domainTransferRequestUpdate } = useDomainTransferRequestUpdate(
		selectedSite.slug,
		selectedDomainName,
		{
			onSuccess() {
				dispatch(
					successNotice(
						translate( 'A domain transfer request has been emailed to the recipient’s address.' ),
						noticeOptions
					)
				);
			},
			onError() {
				dispatch(
					errorNotice(
						translate( 'An error occurred while initiating the domain transfer.' ),
						noticeOptions
					)
				);
			},
		}
	);

	const { domainTransferRequestDelete } = useDomainTransferRequestDelete(
		selectedSite.slug,
		selectedDomainName,
		{
			onSuccess() {
				dispatch(
					successNotice( translate( 'Your domain transfer has been cancelled.' ), noticeOptions )
				);
			},
			onError() {
				dispatch(
					errorNotice(
						translate( 'The domain transfer cannot be cancelled at this time.' ),
						noticeOptions
					)
				);
			},
		}
	);

	let selectedDomain: ResponseDomain | undefined;
	if ( ! isRequestingSiteDomains ) {
		selectedDomain = getSelectedDomain( { domains, selectedDomainName } );
	}

	const disableForm = ! hasSiteDomainsLoaded || isRequestingSiteDomains || isLoading;

	const handleEmailChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const email = event.target.value;

		setEmail( email );

		if ( email.length > 0 && ! emailValidator.validate( email ) ) {
			setIsValidEmail( false );
			setErrorMessage( translate( 'Please enter a valid email address.' ) );
		}

		setIsValidEmail( true );
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( email.length > 0 && ! emailValidator.validate( email ) ) {
			setIsValidEmail( false );
			setErrorMessage( translate( 'Please enter a valid email address.' ) );
			return false;
		}

		domainTransferRequestUpdate( email );

		return false;
	};

	const handleDelete = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		setEmail( '' );
		setIsValidEmail( true );
		setErrorMessage( '' );
		domainTransferRequestDelete();

		return false;
	};

	const hasEmailWithUs =
		selectedDomain && ( hasTitanMailWithUs( selectedDomain ) || hasGSuiteWithUs( selectedDomain ) );

	const renderForm = () => {
		if ( selectedDomain?.isHundredYearDomain ) {
			return <HundredYearDomainNotTransferrableNotice />;
		}

		if ( ! selectedDomain?.currentUserCanManage ) {
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.aftermarketAuction ) {
			return <AftermarketAutcionNotice domainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.isRedeemable ) {
			return <NonTransferrableDomainNotice domainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.pendingRegistration || selectedDomain?.pendingRegistrationAtRegistry ) {
			return (
				<TransferUnavailableNotice
					message={ translate(
						'We are still setting up your domain. You will not be able to transfer it until the registration setup is done.'
					) }
				></TransferUnavailableNotice>
			);
		}

		return (
			<Card className="transfer-domain-to-any-user__card">
				<p>
					{ translate(
						'You can transfer the domain to any WordPress.com user. If the user does not have a WordPress.com account, they will be prompted to create one.'
					) }
				</p>
				<p>
					{ translate(
						'The recipient will need to provide updated contact information and accept the request before the domain transfer can be completed.'
					) }
				</p>
				{ transferEmail && (
					<Card className="transfer-domain-to-any-user__pending-transfer-card">
						<form onSubmit={ handleDelete }>
							<h2>{ translate( 'Domain transfer pending' ) }</h2>
							<div className="transfer-domain-to-any-user__pending-detail">
								<strong>{ translate( 'Status' ) }</strong>
								<div>
									<span className="transfer-domain-to-any-user__pending-status">
										{ translate( 'Pending' ) }
									</span>
								</div>
							</div>
							<div className="transfer-domain-to-any-user__pending-detail">
								<strong>{ translate( 'Transfer recipient' ) }</strong>
								<div>
									<span>{ transferEmail }</span>
								</div>
							</div>

							<div className="transfer-domain-to-any-user__pending-detail">
								<strong>{ translate( 'Valid until' ) }</strong>
								<div>{ moment( expiresAt ).format( 'LLL' ) }</div>
							</div>
							<FormButton type="submit">{ translate( 'Cancel transfer' ) }</FormButton>
						</form>
					</Card>
				) }
				{ ! transferEmail && (
					<form onSubmit={ handleSubmit }>
						<FormFieldset>
							<FormLabel>{ translate( 'Enter domain recipient’s email for transfer' ) }</FormLabel>
							<FormTextInput
								disabled={ disableForm }
								name="email"
								onChange={ handleEmailChange }
								value={ email }
								className={ clsx( 'transfer-domain-to-any-user__input', {
									'is-error': ! isValidEmail,
								} ) }
								maxLength={ 1000 }
							/>
							{ ! isValidEmail && <FormInputValidation isError text={ errorMessage } /> }
						</FormFieldset>
						<div className="transfer-domain-to-any-user__notice">
							<Gridicon icon="info-outline" size={ 18 } />
							<p>
								{ translate(
									'Transferring a domain to another user will give all the rights of this domain to that user. You will no longer be able to manage the domain.'
								) }
							</p>
						</div>
						{ hasEmailWithUs && (
							<div className="transfer-domain-to-any-user__notice">
								<Gridicon icon="info-outline" size={ 18 } />
								<p>
									{ translate(
										'The email subscription for %(domainName)s will be transferred along with the domain.',
										{ args: { domainName: selectedDomainName } }
									) }
								</p>
							</div>
						) }
						<FormButton disabled={ disableForm } type="submit">
							{ translate( 'Transfer domain' ) }
						</FormButton>
					</form>
				) }
			</Card>
		);
	};

	const renderHeader = () => {
		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				href: domainManagementList(
					selectedSite?.slug,
					selectedDomainName,
					selectedSite?.options?.is_domain_only
				),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Connect' ),
				href: domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'To another WordPress.com user' ),
			},
		];

		const mobileItem = {
			label: translate( 'Back to Transfer' ),
			href: domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return (
			<DomainHeader
				items={ items }
				mobileItem={ mobileItem }
				titleOverride={
					<FormattedHeader
						hasScreenOptions={ false }
						headerText={ translate( 'Transfer to another WordPress.com user' ) }
						align="left"
					/>
				}
			/>
		);
	};

	if ( isLoading ) {
		return (
			<DomainMainPlaceholder
				breadcrumbs={ renderHeader }
				backHref={ domainManagementTransfer(
					selectedSite?.slug,
					selectedDomainName,
					currentRoute
				) }
			/>
		);
	}

	return (
		<Main wideLayout className="transfer-domain-to-any-user">
			<BodySectionCssClass
				bodyClass={ [ 'transfer-domain-to-any-user' ] }
				group="transfer-domain-to-any-user"
				section="transfer-domain-to-any-user"
			/>
			{ renderHeader() }
			<div className="transfer-domain-to-any-user__container">
				<div className="transfer-domain-to-any-user__main">{ renderForm() }</div>
			</div>
		</Main>
	);
}
