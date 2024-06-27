import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { CheckboxControl, TextControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import {
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useFormSelectors } from '../components/hooks/use-form-selectors';
import ProductsSelector from '../components/products-selector';
import ServicesSelector from '../components/services-selector';
import { PARTNER_DIRECTORY_DASHBOARD_SLUG } from '../constants';
import { AgencyDirectoryApplication, DirectoryApplicationType } from '../types';
import useExpertiseForm from './hooks/use-expertise-form';
import useSubmitForm from './hooks/use-submit-form';

import './style.scss';

type DirectoryClientSamplesProps = {
	label: string | ReactNode;
	samples: string[];
	onChange: ( samples: string[] ) => void;
};

const DirectoryClientSamples = ( { label, samples, onChange }: DirectoryClientSamplesProps ) => {
	const translate = useTranslate();

	const onSampleChange = ( index: number, value: string ) => {
		onChange( samples.map( ( sample, i ) => ( i === index ? value : sample ) ) );
	};

	return (
		<div className="partner-directory-agency-expertise__directory-client-site">
			<h3 className="partner-directory-agency-expertise__client-samples-label">{ label }</h3>
			<div className="partner-directory-agency-expertise__client-samples">
				{ samples.map( ( sample, index ) => (
					<TextControl
						key={ `client-sample-${ index }` }
						type="text"
						placeholder={ translate( 'Enter URL' ) }
						value={ sample }
						onChange={ ( value ) => onSampleChange( index, value ) }
					/>
				) ) }
			</div>
		</div>
	);
};

type Props = {
	initialFormData: AgencyDirectoryApplication | null;
};

const AgencyExpertise = ( { initialFormData }: Props ) => {
	const translate = useTranslate();

	const { availableDirectories } = useFormSelectors();

	const onSubmitSuccess = useCallback(
		( response: Agency ) => {
			response && reduxDispatch( setActiveAgency( response ) );

			reduxDispatch(
				successNotice( translate( 'Your Partner Directory application was submitted!' ), {
					displayOnNextPage: true,
					duration: 6000,
				} )
			);
			page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
		},
		[ page, reduxDispatch, translate ]
	);

	const onSubmitError = useCallback( () => {
		reduxDispatch(
			errorNotice( translate( 'Something went wrong submitting your application!' ), {
				duration: 6000,
			} )
		);
	}, [ reduxDispatch, translate ] );

	const {
		formData,
		setFormData,
		isValidFormData,
		isDirectorySelected,
		isDirectoryApproved,
		setDirectorySelected,
		getDirectoryClientSamples,
		setDirectorClientSample,
	} = useExpertiseForm( { initialFormData } );

	const { onSubmit, isSubmitting } = useSubmitForm( { formData, onSubmitSuccess, onSubmitError } );

	const { services, products, directories, feedbackUrl } = formData;

	const directoryOptions = Object.keys( availableDirectories ) as DirectoryApplicationType[];

	return (
		<Form
			className="partner-directory-agency-expertise"
			title={ translate( 'Share your expertise' ) }
			autocomplete="off"
			description={ translate( "Pick your agency's specialties and choose your directories." ) }
		>
			<FormSection title={ translate( 'Product and Service' ) }>
				<FormField
					label={ translate( 'What services do you offer?' ) }
					description={ translate(
						'We allow each agency to offer up to five services to help you focus on what you do best.'
					) }
					isRequired
				>
					<ServicesSelector
						selectedServices={ services }
						setServices={ ( value ) =>
							setFormData( ( state ) => ( {
								...state,
								services: value as string[],
							} ) )
						}
					/>
				</FormField>

				<FormField label={ translate( 'What products do you work with?' ) } isRequired>
					<ProductsSelector
						selectedProducts={ products }
						setProducts={ ( value ) =>
							setFormData( ( state ) => ( {
								...state,
								products: value as string[],
							} ) )
						}
					/>
				</FormField>
			</FormSection>

			<FormSection title={ translate( 'Partner Directories' ) }>
				<FormField
					label={ translate( 'Automattic Partner Directories' ) }
					sub={ translate( 'Select the Automattic directories you would like to appear on.' ) }
					isRequired
				>
					<div className="partner-directory-agency-expertise__directory-options">
						{ directoryOptions.map( ( directory ) => (
							<CheckboxControl
								key={ `directory-${ directory }` }
								label={ availableDirectories[ directory ] }
								checked={ isDirectorySelected( directory ) }
								onChange={ ( value ) => setDirectorySelected( directory, value ) }
								disabled={ isDirectoryApproved( directory ) }
							/>
						) ) }
					</div>
				</FormField>

				{ !! directories.length && (
					<FormField
						label={ translate( 'Client sites' ) }
						sub={ translate(
							"For each directory you selected, provide URLs of 5 client sites you've worked on. This helps us gauge your expertise."
						) }
						isRequired
					>
						<div className="partner-directory-agency-expertise__directory-client-sites">
							{ directories.map( ( { directory } ) => (
								<DirectoryClientSamples
									key={ `directory-samples-${ directory }` }
									label={ translate( 'Relevant examples for %(directory)s', {
										args: {
											directory: availableDirectories[ directory ],
										},
										comment: '%(directory)s is the directory name, e.g. "WordPress.com"',
									} ) }
									samples={ getDirectoryClientSamples( directory ) }
									onChange={ ( samples: string[] ) =>
										setDirectorClientSample( directory, samples )
									}
								/>
							) ) }
						</div>
					</FormField>
				) }

				<FormField
					label={ translate( 'Share customer feedback' ) }
					description={ translate(
						'Share a link to your customer feedback from Google, Clutch, Facebook, etc., or testimonials featured on your website. If you don’t have online reviews, provide a link to client references or case studies.'
					) }
					isRequired
				>
					<TextControl
						type="text"
						placeholder={ translate( 'Enter URL' ) }
						value={ feedbackUrl }
						onChange={ ( value ) =>
							setFormData( ( state ) => ( {
								...state,
								feedbackUrl: value,
							} ) )
						}
					/>
				</FormField>
			</FormSection>

			<div className="partner-directory-agency-cta__required-information">
				{ translate( '* indicates a required information' ) }
			</div>

			<div className="partner-directory-agency-cta__footer">
				<Button
					href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }` }
					disabled={ isSubmitting }
				>
					{ translate( 'Cancel' ) }
				</Button>

				<Button primary onClick={ onSubmit } disabled={ ! isValidFormData || isSubmitting }>
					{ initialFormData
						? translate( 'Update my expertise' )
						: translate( 'Submit my application' ) }
				</Button>
			</div>
		</Form>
	);
};

export default AgencyExpertise;
