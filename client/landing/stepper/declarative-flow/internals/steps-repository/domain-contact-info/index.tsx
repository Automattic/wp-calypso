import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon, Button, ConfettiAnimation } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { camelToSnakeCase, mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import ContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	useDomainTransferReceive,
	TransferInfo,
} from 'calypso/data/domains/transfers/use-domain-transfer-receive';
import { useDomainParams } from 'calypso/landing/stepper/hooks/use-domain-params';
import wp from 'calypso/lib/wp';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import type { StepProps, ProvidedDependencies } from '../../types';
import './styles.scss';

export default function DomainContactInfo( { navigation }: StepProps ) {
	const { submit } = navigation;
	const translate = useTranslate();
	const [ success, setSuccess ] = useState( false );

	return (
		<StepContainer
			hideBack
			stepName="domain-contact-info-header"
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					className="domain-contact-info-header"
					headerText={
						success
							? translate( 'Your domain transfer is underway!' )
							: translate( 'Your contact details are needed' )
					}
					subHeaderText={
						success
							? translate(
									'Domain transfers can take a few minutes, we’ll email you once it’s set up.'
							  )
							: translate(
									'To accept a domain transfer we are required to collect your contact information.'
							  )
					}
				/>
			}
			stepContent={
				<>
					{ success && <SuccessContent /> }
					{ ! success && <ContactInfo onSubmit={ submit } setSuccess={ setSuccess } /> }
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}

function SuccessContent() {
	const translate = useTranslate();
	useEffect( () => {
		recordTracksEvent( 'calypso_domain_transfer_start_success' );
	}, [] );

	return (
		<div className="domain-contact-info__success">
			<ConfettiAnimation />
			<Button className="domain-contact-info__success-cta" href={ domainManagementRoot() } primary>
				{ translate( 'Manage domains' ) }
			</Button>
		</div>
	);
}

function ContactInfo( {
	onSubmit,
	setSuccess,
}: {
	onSubmit:
		| ( ( providedDependencies?: ProvidedDependencies | undefined, ...params: string[] ) => void )
		| undefined;
	setSuccess: React.Dispatch< React.SetStateAction< boolean > >;
} ) {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { domain } = useDomainParams();
	const dispatch = useDispatch();

	const { domainTransferReceive } = useDomainTransferReceive( domain ?? '', {
		onSuccess( data ) {
			if ( data.success ) {
				setSuccess( true );
			} else {
				dispatch(
					errorNotice(
						translate( 'Domain transfers are currently unavailable, please try again later.' ),
						{
							duration: 10000,
						}
					)
				);
			}
		},
		onError( error ) {
			if ( error.error === 'authorization_required' ) {
				dispatch(
					errorNotice(
						translate(
							'The receiving user’s email address must match the email address of the domain receipient.'
						),
						{
							duration: 10000,
						}
					)
				);
			} else if ( error.error === 'invite_expired' ) {
				dispatch(
					errorNotice(
						translate(
							'The domain transfer invitation is no longer valid, please ask the domain owner to request a new transfer.'
						),
						{
							duration: 10000,
						}
					)
				);
			} else {
				dispatch(
					errorNotice( translate( 'An error occurred while transferring the domain.' ), {
						duration: 10000,
					} )
				);
			}
		},
	} );

	function getIsFieldDisabled() {
		return false;
	}

	function validate(
		fieldValues: Record< string, unknown >,
		onComplete: ( nullOrError: null | Error, data?: Record< string, unknown > | undefined ) => void
	) {
		wp.req
			.post(
				'/me/domain-contact-information/validate',
				mapRecordKeysRecursively(
					{
						contactInformation: fieldValues,
						domainNames: [ domain ],
					},
					camelToSnakeCase
				)
			)
			.then( ( data: { messages: Record< string, unknown > } ) => {
				onComplete( null, mapRecordKeysRecursively( data?.messages || {}, snakeToCamelCase ) );
			} )
			.catch( ( error: Error ) => {
				onComplete( error );
			} );
	}

	function submitForm( contactInfo: TransferInfo ) {
		domainTransferReceive( contactInfo );
		onSubmit?.( contactInfo );
	}

	const renderContent = () => {
		return (
			<ContactDetailsFormFields
				eventFormName="Edit Contact Info"
				contactDetails={ {
					firstName: '',
					lastName: '',
					organization: '',
					email: '',
					phone: '',
					address1: '',
					address2: '',
					city: '',
					state: '',
					postalCode: '',
					countryCode: '',
					fax: '',
				} }
				needsFax={ domain?.endsWith( '.nl' ) }
				getIsFieldDisabled={ getIsFieldDisabled }
				onSubmit={ submitForm }
				onValidate={ validate }
				labelTexts={ { submitButton: translate( 'Accept domain transfer' ) } }
				isSubmitting={ false }
				updateWpcomEmailCheckboxHidden={ true }
				cancelHidden={ true }
			>
				<div className="domain-contact-info-form__terms">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						{ translate(
							'By accepting this transfer, you agree to the {{a}}Domain Registration Agreement{{/a}} for %(domainName)s.',
							{
								args: {
									domainName: domain ?? '',
								},
								components: {
									a: (
										<a
											href={ localizeUrl(
												'https://wordpress.com/automattic-domain-name-registration-agreement/'
											) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</div>
			</ContactDetailsFormFields>
		);
	};

	const renderSidebar = () => {
		const supportLink = (
			<ExternalLink
				href={ localizeUrl(
					'https://wordpress.com/support/domains/domain-registrations-and-privacy/#privacy-protection'
				) }
				target="_blank"
				icon={ false }
			/>
		);
		const icannLink = (
			<ExternalLink
				href="https://www.icann.org/resources/pages/contact-verification-2013-05-03-en"
				target="_blank"
				icon={ false }
			/>
		);

		return (
			<div className="domain-contact-info__sidebar">
				<div className="domain-contact-info__sidebar-title">
					<p>
						<strong>{ translate( 'Provide accurate contact information' ) }</strong>
					</p>
				</div>
				<div className="domain-contact-info__sidebar-content">
					<p>
						{ translate(
							'{{icannLinkComponent}}ICANN{{/icannLinkComponent}} requires accurate contact information for registrants.',
							{
								components: {
									icannLinkComponent: icannLink,
								},
							}
						) }
					</p>
					<p>
						{ translate(
							'Contact information will be verified after your domain has been transferred. Failure to verify your contact information will result in domain suspension.'
						) }
					</p>
					<p>
						{ translate(
							'Domain privacy service is included for free on applicable domains. {{supportLinkComponent}}Learn more{{/supportLinkComponent}}.',
							{
								components: {
									supportLinkComponent: supportLink,
								},
							}
						) }
					</p>
				</div>
			</div>
		);
	};

	return (
		<form className="domain-contact-info-form">
			<TwoColumnsLayout content={ renderContent() } sidebar={ renderSidebar() } />
		</form>
	);
}
