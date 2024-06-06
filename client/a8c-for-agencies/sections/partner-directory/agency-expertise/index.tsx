import { CheckboxControl, TextControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import ProductsSelector from '../components/products-selector';
import ServicesSelector from '../components/services-selector';
import {
	DIRECTORY_JETPACK,
	DIRECTORY_PRESSABLE,
	DIRECTORY_WOOCOMMERCE,
	DIRECTORY_WPCOM,
} from '../constants';
import { DirectoryApplicationType } from '../types';
import { getPartnerDirectoryLabel } from '../utils/get-partner-directory-label';
import useExpertiseForm from './hooks/use-expertise-form';

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

const AgencyExpertise = () => {
	const translate = useTranslate();

	const {
		formData,
		setFormData,
		isDirectorySelected,
		isDirectoryApproved,
		setDirectorySelected,
		getDirectoryClientSamples,
		setDirectorClientSample,
	} = useExpertiseForm();

	const { services, products, directories, feedbackUrl } = formData;

	const directoryOptions: DirectoryApplicationType[] = [
		DIRECTORY_WPCOM,
		DIRECTORY_WOOCOMMERCE,
		DIRECTORY_JETPACK,
		DIRECTORY_PRESSABLE,
	];

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

				<FormField label={ translate( 'What products do you work with?' ) }>
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
				>
					<div className="partner-directory-agency-expertise__directory-options">
						{ directoryOptions.map( ( directory ) => (
							<CheckboxControl
								key={ `directory-${ directory }` }
								label={ getPartnerDirectoryLabel( directory ) }
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
					>
						<div className="partner-directory-agency-expertise__directory-client-sites">
							{ directories.map( ( { directory } ) => (
								<DirectoryClientSamples
									key={ `directory-samples-${ directory }` }
									label={ translate( 'Relevant examples for %(directory)s', {
										args: {
											directory: getPartnerDirectoryLabel( directory ),
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
						'Great support is key to our success. Share a link to your customer feedback from Google, Clutch, Facebook, etc., or testimonials featured on your website. If you don’t have online reviews, provide a link to client references or case studies.'
					) }
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
		</Form>
	);
};

export default AgencyExpertise;
