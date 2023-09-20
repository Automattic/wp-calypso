import { FormInputValidation, Gridicon, Card } from '@automattic/components';
import classNames from 'classnames';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import useDomainTransferRequestUpdate from 'calypso/data/domains/transfers/use-domain-transfer-request-update';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import AftermarketAutcionNotice from 'calypso/my-sites/domains/domain-management/components/domain/aftermarket-auction-notice';
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
import { errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import TransferUnavailableNotice from '../transfer-unavailable-notice';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

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
	const [ email, setEmail ] = useState( '' );
	const [ isValidEmail, setIsValidEmail ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ submitSuccess, setSubmitSuccess ] = useState( false );

	const currentRoute = useSelector( getCurrentRoute );

	const { domainTransferRequestUpdate } = useDomainTransferRequestUpdate(
		selectedSite?.slug,
		selectedDomainName,
		{
			onSuccess() {
				setSubmitSuccess( true );
			},
			onError() {
				dispatch(
					errorNotice( translate( 'An error occurred while initiating the domain transfer.' ), {
						duration: 5000,
					} )
				);
			},
		}
	);

	let selectedDomain: ResponseDomain | undefined;
	if ( ! isRequestingSiteDomains ) {
		selectedDomain = getSelectedDomain( { domains, selectedDomainName } );
	}

	const isLoading = ! hasSiteDomainsLoaded || isRequestingSiteDomains;

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

	const hasEmailWithUs =
		selectedDomain && ( hasTitanMailWithUs( selectedDomain ) || hasGSuiteWithUs( selectedDomain ) );

	const renderForm = () => {
		if ( ! selectedDomain?.currentUserCanManage ) {
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.aftermarketAuction ) {
			return <AftermarketAutcionNotice domainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.isRedeemable ) {
			return <NonTransferrableDomainNotice domainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.pendingRegistration ) {
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
				{ submitSuccess && (
					<Notice
						text={ translate(
							'A domain transfer request has been emailed to the recipient’s address.'
						) }
						status="is-success"
						onDismissClick={ () => {
							setSubmitSuccess( false );
							setEmail( '' );
						} }
					/>
				) }
				<p>
					{ translate(
						'You can transfer the domain to any WordPress.com user, even if they do not have a site. If the user does not have a WordPress.com account, they will be prompted to create one.'
					) }
				</p>
				<p>
					{ translate(
						'The recipient will need to provide updated contact information and accept the request before the domain transfer can be completed.'
					) }
				</p>

				<form onSubmit={ handleSubmit }>
					<FormFieldset>
						<FormLabel>{ translate( 'Enter domain recipient’s email for transfer' ) }</FormLabel>
						<FormTextInput
							disabled={ isLoading }
							name="email"
							onChange={ handleEmailChange }
							value={ email }
							className={ classNames( 'transfer-domain-to-any-user__input', {
								'is-error': ! isValidEmail,
							} ) }
							maxLength={ 1000 }
						/>
						{ ! isValidEmail && <FormInputValidation isError={ true } text={ errorMessage } /> }
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
					<FormButton disabled={ isLoading } type="submit">
						{ translate( 'Transfer domain' ) }
					</FormButton>
				</form>
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
