import { Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { camelToSnakeCase, mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import ContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields';
import FormattedHeader from 'calypso/components/formatted-header';
import useDomainTransferReceive from 'calypso/data/domains/transfers/use-domain-transfer-receive';
import { useDomainParams } from 'calypso/landing/stepper/hooks/use-domain-params';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { StepProps, ProvidedDependencies } from '../../types';
import './styles.scss';

export default function DomainContactInfo( { navigation }: StepProps ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	return (
		<StepContainer
			hideBack
			stepName="domain-contact-info"
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-contact-info__header"
					headerText={ __( 'Enter your contact information' ) }
					subHeaderText={ __(
						'Domain owners are required to provide correct contact information.'
					) }
				/>
			}
			stepContent={ <ContactInfo onSubmit={ submit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}

function ContactInfo( {
	onSubmit,
}: {
	onSubmit:
		| ( ( providedDependencies?: ProvidedDependencies | undefined, ...params: string[] ) => void )
		| undefined;
} ) {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const { domain } = useDomainParams();
	const dispatch = useDispatch();

	const { domainTransferReceive } = useDomainTransferReceive( domain ?? '', {
		onSuccess() {
			dispatch(
				successNotice(
					translate( 'Your domain is on its way to you, we’ll email you once it’s setup.' ),
					{
						duration: 10000,
						isPersistent: true,
					}
				)
			);
		},
		onError() {
			dispatch(
				errorNotice( translate( 'An error occurred while transferring the domain.' ), {
					duration: 5000,
				} )
			);
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

	function submitForm( contactInfo ) {
		domainTransferReceive( { ...contactInfo } );
		onSubmit( { ...contactInfo } );
	}

	return (
		<form className="domain-contact-info">
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
				<div className="domain-contact-info__terms">
					<strong>{ translate( 'By accepting this transfer' ) }</strong>
				</div>
				<div className="domain-contact-info__term">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						{ translate(
							'You agree to the {{a}}Domain Registration Agreement{{/a}} for %(domainName)s.',
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
		</form>
	);
}
