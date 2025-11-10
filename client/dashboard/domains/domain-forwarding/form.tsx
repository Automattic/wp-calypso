import {
	__experimentalVStack as VStack,
	Button,
	Panel,
	PanelBody,
	PanelRow,
	RadioControl,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import SuffixInputControl from '../../components/input-control/suffix-input-control';
import { isTargetUrlValid, isSubdomainValid } from './utils';
import type { DomainForwarding } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export interface FormData {
	sourceType: 'root' | '';
	subdomain: string;
	targetUrl: string;
	isPermanent: boolean;
	forwardPaths: boolean;
}

interface DomainForwardingFormProps {
	domainName: string;
	initialData?: DomainForwarding | null;
	onSubmit: ( data: FormData ) => void;
	isSubmitting: boolean;
	submitButtonText: string;
	forceSubdomain: boolean;
}

export default function DomainForwardingForm( {
	domainName,
	initialData,
	onSubmit,
	isSubmitting,
	submitButtonText,
	forceSubdomain,
}: DomainForwardingFormProps ) {
	const [ formData, setFormData ] = useState< FormData >( () => {
		if ( ! initialData ) {
			return {
				sourceType: '',
				subdomain: '',
				targetUrl: '',
				isPermanent: false,
				forwardPaths: false,
			};
		}
		const protocol = initialData.is_secure ? 'https://' : 'http://';
		return {
			sourceType: initialData.subdomain ? '' : 'root',
			subdomain: initialData.subdomain || '',
			targetUrl: `${ protocol }${ initialData.target_host }${ initialData.target_path || '' }`,
			isPermanent: initialData.is_permanent,
			forwardPaths: initialData.forward_paths,
		};
	} );

	const hasNonDefaultAdvancedValues = Boolean(
		initialData && ( initialData.is_permanent !== false || initialData.forward_paths !== false )
	);

	const isPermanentField = {
		id: 'isPermanent',
		label: __( 'HTTP redirect type' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Temporary redirect (307)' ),
				value: 'false',
				description: __( 'Enables quick propagation of changes to your forwarding address.' ),
			},
			{
				label: __( 'Permanent redirect (301)' ),
				value: 'true',
				description: __(
					'Enables browser caching of the forwarding address for quicker resolution. Note that changes might take longer to fully propagate.'
				),
			},
		],
	};
	const forwardPathsField = {
		id: 'forwardPaths',
		label: __( 'Path forwarding' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Do not forward' ),
				value: 'false',
			},
			{
				label: __( 'Forward path' ),
				value: 'true',
				description: __(
					'Redirects the path after the domain name to the corresponding path at the new address.'
				),
			},
		],
	};

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'sourceType',
				label: __( 'Type' ),
				type: 'text' as const,
				Edit: 'select',
				elements: [
					{
						label: 'Subdomain',
						value: '',
					},
					{
						label: 'Domain',
						value: 'root',
					},
				],
				isVisible: () => {
					return ! forceSubdomain;
				},
			},
			{
				id: 'subdomain',
				label: __( 'Source URL' ),
				help: __( 'Enter the subdomain (e.g., "blog")' ),
				type: 'text' as const,
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					const isDisabled = data.sourceType !== '';
					const suffix = isDisabled ? '' : `.${ domainName }`;
					const value = getValue( { item: data } );
					const validationMessage = field.isValid?.custom?.( data, field );

					return (
						<SuffixInputControl
							required={ !! field.isValid?.required }
							label={ field.label }
							placeholder={ field.placeholder }
							disabled={ isDisabled }
							value={ isDisabled ? domainName : value }
							onChange={ ( value: string ) => {
								return onChange( { [ id ]: value } );
							} }
							customValidity={
								validationMessage ? { type: 'invalid', message: validationMessage } : undefined
							}
							suffix={ suffix }
						/>
					);
				},
				isValid: {
					required: true,
					custom: ( item ) => {
						if ( ! isSubdomainValid( item.subdomain ) ) {
							return __(
								'Subdomain should be a valid domain label - up to 63 characters, starting with a letter or number, and containing only letters, numbers, and hyphens.'
							);
						}
						return null;
					},
				},
			},
			{
				id: 'targetUrl',
				label: __( 'Target URL' ),
				help: __( 'The URL to redirect to (e.g., https://example.com/path)' ),
				type: 'text',
				isValid: {
					required: true,
					custom: ( item ) => {
						if ( ! isTargetUrlValid( item.targetUrl, domainName ) ) {
							return __( 'Please enter a valid URL.' );
						}
						return null;
					},
				},
			},
		],
		[ domainName, forceSubdomain ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [
			{
				id: 'source',
				children: [ 'sourceType', 'subdomain' ],
				layout: {
					type: 'row' as const,
					alignment: 'start' as const,
					styles: {
						sourceType: { flex: 1 },
						subdomain: { flex: 3 },
					},
				},
			},
			'targetUrl',
		],
	};

	const mobileForm = {
		layout: { type: 'regular' as const },
		fields: [ 'sourceType', 'subdomain', 'targetUrl' ],
	};

	const [ currentForm, setForm ] = useState( form );

	// Reflow the form based on the width of the container for mobile/desktop
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			if ( firstEntry.contentRect.width > 535 ) {
				setForm( form );
			} else {
				setForm( mobileForm );
			}
		}
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit( formData );
	};

	const { validity } = useFormValidity( formData, fields, form );

	return (
		<Card>
			<CardBody>
				<div ref={ ref }>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< FormData >
								data={ formData }
								fields={ fields }
								validity={ validity }
								form={ currentForm }
								onChange={ ( edits: Partial< FormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>

							<Panel>
								<PanelBody
									title={ __( 'Advanced settings' ) }
									initialOpen={ hasNonDefaultAdvancedValues }
								>
									<PanelRow>
										<VStack spacing={ 6 } style={ { marginTop: '12px' } }>
											<RadioControl
												label={ isPermanentField.label }
												selected={ formData.isPermanent ? 'true' : 'false' }
												options={ isPermanentField.elements }
												onChange={ ( value: string ) => {
													setFormData( ( data ) => ( {
														...data,
														isPermanent: value === 'true',
													} ) );
												} }
											/>
											<RadioControl
												label={ forwardPathsField.label }
												selected={ formData.forwardPaths ? 'true' : 'false' }
												options={ forwardPathsField.elements }
												onChange={ ( value: string ) => {
													setFormData( ( data ) => ( {
														...data,
														forwardPaths: value === 'true',
													} ) );
												} }
											/>
										</VStack>
									</PanelRow>
								</PanelBody>
							</Panel>
							<ButtonStack justify="start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isSubmitting }
									disabled={ isSubmitting }
								>
									{ submitButtonText }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</div>
			</CardBody>
		</Card>
	);
}
