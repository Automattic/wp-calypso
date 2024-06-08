import { CheckboxControl, FormTokenField, TextControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import {
	EXPERTISE_FORM_FIELD_CUSTOMER_FEEDBACK_URL,
	EXPERTISE_FORM_FIELD_PRODUCTS,
	EXPERTISE_FORM_FIELD_SERVICES,
} from '../constants';
import { getPartnerDirectoryLabel } from '../utils/get-partner-directory-label';
import useExpertiseForm from './hooks/use-expertise-form';

import './style.scss';

type DirectoryClientSamplesProps = {
	label: string | ReactNode;
	samples: string[];
	onSampleChange: ( index: number, value: string ) => void;
};

const DirectoryClientSamples = ( {
	label,
	samples,
	onSampleChange,
}: DirectoryClientSamplesProps ) => {
	const translate = useTranslate();
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

const AgencyExpertise = () => {
	const translate = useTranslate();

	const {
		getFormValue,
		setFormValue,
		isDirectorySelected,
		setDirectorySelected,
		getDirectories,
		getSelectedDirectories,
		getDirectoryClientSamples,
		setDirectorClientSample,
	} = useExpertiseForm();

	const selectedDirectories = getSelectedDirectories();

	const directories = getDirectories();

	return (
		<Form
			className="partner-directory-agency-expertise"
			title={ translate( 'Share your expertise' ) }
			description={ translate( "Pick your agency's specialties and choose your directories." ) }
		>
			<FormSection title={ translate( 'Product and Service' ) }>
				<FormField
					label={ translate( 'What services do you offer?' ) }
					description={ translate(
						'We allow each agency to offer up to five services to help you focus on what you do best.'
					) }
				>
					<FormTokenField
						label=""
						value={ getFormValue( EXPERTISE_FORM_FIELD_SERVICES ) as string[] }
						onChange={ ( value ) => setFormValue( EXPERTISE_FORM_FIELD_SERVICES, value ) }
						__experimentalShowHowTo={ false }
						__nextHasNoMarginBottom
					/>
				</FormField>

				<FormField label={ translate( 'What products do you work with?' ) }>
					<FormTokenField
						label=""
						value={ getFormValue( EXPERTISE_FORM_FIELD_PRODUCTS ) as string[] }
						onChange={ ( value ) => setFormValue( EXPERTISE_FORM_FIELD_PRODUCTS, value ) }
						__experimentalShowHowTo={ false }
						__nextHasNoMarginBottom
					/>
				</FormField>
			</FormSection>

			<FormSection title={ translate( 'Partner Directories' ) }>
				<FormField
					label={ translate( 'Automattic Partner Directories' ) }
					sub={ translate( 'Select the Automattic directories you would like to appear on.' ) }
				>
					<div className="partner-directory-agency-expertise__directory-options">
						{ directories.map( ( directory ) => (
							<CheckboxControl
								key={ `directory-${ directory }` }
								label={ getPartnerDirectoryLabel( directory ) }
								checked={ isDirectorySelected( directory ) }
								onChange={ ( value ) => setDirectorySelected( directory, value ) }
							/>
						) ) }
					</div>
				</FormField>

				{ !! selectedDirectories.length && (
					<FormField
						label={ translate( 'Client sites' ) }
						sub={ translate(
							"For each directory you selected, provide URLs of 5 client sites you've worked on. This helps us gauge your expertise."
						) }
					>
						<div className="partner-directory-agency-expertise__directory-client-sites">
							{ selectedDirectories.map( ( directory ) => (
								<DirectoryClientSamples
									key={ `directory-samples-${ directory }` }
									label={ translate( 'Relevant examples for %(directory)s', {
										args: {
											directory: getPartnerDirectoryLabel( directory ),
										},
										comment: '%(directory)s is the directory name, e.g. "WordPress.com"',
									} ) }
									samples={ getDirectoryClientSamples( directory ) }
									onSampleChange={ ( index, value ) =>
										setDirectorClientSample( directory, index, value )
									}
								/>
							) ) }
						</div>
					</FormField>
				) }

				<FormField
					label={ translate( 'Share customer feedback' ) }
					description={ translate(
						'Great support is key to our success. Share a link to your customer feedback from Google, Clutch, Facebook, etc., or testimonials featured on your website. If you don’t have online reviews, provide a link to client references or case studies.'
					) }
				>
					<TextControl
						type="text"
						placeholder={ translate( 'Enter URL' ) }
						value={ getFormValue( EXPERTISE_FORM_FIELD_CUSTOMER_FEEDBACK_URL ) as string }
						onChange={ ( value ) =>
							setFormValue( EXPERTISE_FORM_FIELD_CUSTOMER_FEEDBACK_URL, value )
						}
					/>
				</FormField>
			</FormSection>
		</Form>
	);
};

export default AgencyExpertise;
