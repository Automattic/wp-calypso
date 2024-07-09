import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CheckboxControl, Icon, Modal, Spinner } from '@wordpress/components';
import { check, closeSmall } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import useCreateWPCOMSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-create-wpcom-site';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { useDataCenterOptions } from 'calypso/data/data-center/use-data-center-options';
import { usePhpVersions } from 'calypso/data/php-versions/use-php-versions';
import { useSiteName } from './use-site-name';

import './style.scss';

type SiteConfigurationsModalProps = {
	closeModal: () => void;
	onCreateSiteSuccess: ( id: number ) => void;
	randomSiteName: string;
	isRandomSiteNameLoading: boolean;
	siteId: number;
};

export default function SiteConfigurationsModal( {
	closeModal,
	onCreateSiteSuccess,
	randomSiteName,
	isRandomSiteNameLoading,
	siteId,
}: SiteConfigurationsModalProps ) {
	const [ allowClientsToUseSiteHelpCenter, setAllowClientsToUseSiteHelpCenter ] = useState( true );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const translate = useTranslate();
	const dataCenterOptions = useDataCenterOptions();
	const { phpVersions } = usePhpVersions();
	const siteName = useSiteName( randomSiteName, isRandomSiteNameLoading, siteId );
	const { mutate: createWPCOMSite } = useCreateWPCOMSiteMutation();

	const toggleAllowClientsToUseSiteHelpCenter = () =>
		setAllowClientsToUseSiteHelpCenter( ! allowClientsToUseSiteHelpCenter );

	const phpVersionsElements = phpVersions.map( ( version ) => {
		if ( version.disabled ) {
			return null;
		}

		return (
			<option value={ version.value } key={ version.value }>
				{ version.label }
			</option>
		);
	} );

	const dataCenterOptionsElements = (
		Object.keys( dataCenterOptions ) as Array< keyof typeof dataCenterOptions >
	 ).map( ( key ) => (
		<option key={ key } value={ key }>
			{ dataCenterOptions[ key as keyof typeof dataCenterOptions ] }
		</option>
	) );

	const onSiteNameKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
		}
	};

	const onSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setIsSubmitting( true );
		const formData = new FormData( event.currentTarget );
		const phpVersion = formData.get( 'php_version' ) as string;
		const primaryDataCenter = ( formData.get( 'primary_data_center' ) as string ) || undefined;
		const params = {
			id: siteId,
			site_name: siteName.siteName,
			php_version: phpVersion,
			primary_data_center: primaryDataCenter,
			is_fully_managed_agency_site: ! allowClientsToUseSiteHelpCenter,
		};
		createWPCOMSite( params, {
			onSuccess: () => {
				onCreateSiteSuccess( siteId );
			},
			onError: async ( error ) => {
				if ( error.status === 400 ) {
					await siteName.revalidateCurrentSiteName();
					setIsSubmitting( false );
				}
			},
		} );
	};

	const onRequestCloseModal = () => {
		if ( ! isSubmitting ) {
			closeModal();
		}
	};

	return (
		<Modal
			title={ translate( 'Configure your new site' ) }
			onRequestClose={ onRequestCloseModal }
			className="configure-your-site-modal-form"
		>
			<form onSubmit={ onSubmit }>
				<FormField
					label={ translate( 'Site address' ) }
					description={ translate(
						'After creating your site, you can connect a custom domain for the address.'
					) }
				>
					<div className="configure-your-site-modal-form__site-name-wrapper">
						{ isRandomSiteNameLoading ? (
							<div className="configure-your-site-modal-form__site-name-placeholder" />
						) : (
							<FormTextInputWithAffixes
								className="configure-your-site-modal-form__input"
								name="site_name"
								isError={ siteName.showValidationMessage }
								value={ siteName.siteName }
								onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
									siteName.setSiteName( event.target.value )
								}
								onKeyDown={ onSiteNameKeyDown }
								suffix=".wpcomstaging.com"
								noWrap
								spellCheck="false"
								disabled={ isSubmitting }
							/>
						) }
						<div className="configure-your-site-modal-form__site-name-icon-wrapper">
							{ siteName.isSiteNameReadyForUse && (
								<Icon
									icon={ check }
									size={ 28 }
									className="configure-your-site-modal-form__site-name-success"
								/>
							) }
							{ siteName.showValidationMessage && (
								<Icon
									icon={ closeSmall }
									size={ 28 }
									color="red"
									className="configure-your-site-modal-form__site-name-fail"
								/>
							) }
							{ siteName.isCheckingSiteAvailability && (
								<Spinner className="configure-your-site-modal-form__site-name-loading" />
							) }
						</div>
					</div>
					{ siteName.showValidationMessage && (
						<div className="configure-your-site-modal-form__site-name-validation-message">
							<Gridicon icon="info-outline" size={ 16 } />
							{ siteName.validationMessage }
						</div>
					) }
				</FormField>
				<FormField
					label={ translate( 'PHP version' ) }
					description={ translate(
						'The PHP version can be changed after your site is created via {{a}}Web Server Settings{{/a}}.',
						{
							components: {
								a: (
									<a
										target="_blank"
										href="https://developer.wordpress.com/docs/developer-tools/web-server-settings/"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				>
					<FormSelect
						className="configure-your-site-modal-form__php-version-select"
						name="php_version"
						onChange={ () => {} }
						disabled={ isSubmitting }
					>
						{ phpVersionsElements }
					</FormSelect>
				</FormField>
				<FormField label={ translate( 'Primary data center' ) }>
					<FormSelect disabled={ isSubmitting } name="primary_data_center" onChange={ () => {} }>
						<option value="">{ translate( 'No preference' ) }</option>
						{ dataCenterOptionsElements }
					</FormSelect>
				</FormField>
				<FormField label="">
					<div className="configure-your-site-modal-form__allow-clients-to-use-help-center">
						<CheckboxControl
							id="configure-your-site-modal-form__allow-clients-to-use-help-center-checkbox"
							onChange={ toggleAllowClientsToUseSiteHelpCenter }
							checked={ allowClientsToUseSiteHelpCenter }
							name="is_fully_managed_agency_site"
							disabled={ isSubmitting }
						/>
						<label htmlFor="configure-your-site-modal-form__allow-clients-to-use-help-center-checkbox">
							{ translate(
								'Allow clients to use the {{HcLink}}WordPress.com Help Center{{/HcLink}} and {{HfLink}}hosting features.{{/HfLink}}',
								{
									components: {
										HcLink: (
											<a
												target="_blank"
												href={ localizeUrl(
													'https://wordpress.com/support/help-support-options/#how-to-contact-us'
												) }
												rel="noreferrer"
											/>
										),
										HfLink: (
											<a
												target="_blank"
												href={ localizeUrl(
													'https://developer.wordpress.com/docs/developer-tools/web-server-settings/'
												) }
												rel="noreferrer"
											/>
										),
									},
								}
							) }
						</label>
					</div>
				</FormField>
				<div className="configure-your-site-modal-form__footer">
					<Button
						primary
						type="submit"
						busy={ isSubmitting }
						disabled={ ! siteName.isSiteNameReadyForUse }
					>
						{ translate( 'Create site' ) }
					</Button>
				</div>
			</form>
		</Modal>
	);
}
