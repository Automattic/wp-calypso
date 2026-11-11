import {
	__experimentalVStack as VStack,
	Button,
	PanelBody,
	PanelRow,
	RadioControl,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import SuffixInputControl from '../../components/input-control/suffix-input-control';
import {
	getForwardingSummary,
	isTargetUrlValid,
	isSubdomainValid,
	normalizeUrlWithDefaultProtocol,
} from './utils';
import type { DomainForwarding } from '@automattic/api-core';
import './form.scss';
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
	defaultSourceType?: FormData[ 'sourceType' ];
}

export default function DomainForwardingForm( {
	domainName,
	initialData,
	onSubmit,
	isSubmitting,
	submitButtonText,
	forceSubdomain,
	defaultSourceType = '',
}: DomainForwardingFormProps ) {
	const [ formData, setFormData ] = useState< FormData >( () => {
		if ( ! initialData ) {
			return {
				sourceType: forceSubdomain ? '' : defaultSourceType,
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

	const exampleSource =
		formData.sourceType === '' && formData.subdomain
			? `${ formData.subdomain }.${ domainName }`
			: domainName;
	const exampleTarget =
		normalizeUrlWithDefaultProtocol( formData.targetUrl.trim() ).replace( /\/+$/, '' ) ||
		'https://example.com';

	const isPermanentField = {
		id: 'isPermanent',
		label: __( 'How permanent is this forward?' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Temporary (307)' ),
				value: 'false',
				description: __(
					'Search results keep pointing at this domain name, and a change you make later takes effect straight away. Choose this if you might turn the forward off again.'
				),
			},
			{
				label: __( 'Permanent (301)' ),
				value: 'true',
				description: __(
					'Search results move across to the new address over time, and browsers remember the forward. Choose this if the move is for good. A change you make later can take a while to reach people who have already visited.'
				),
			},
		],
	};
	const forwardPathsField = {
		id: 'forwardPaths',
		label: __( 'Where visitors land' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Always the same address' ),
				value: 'false',
				description: sprintf(
					/* translators: %(source)s is the forwarded domain name, %(target)s is the destination URL. */
					__( '%(source)s/prices goes to %(target)s.' ),
					{ source: exampleSource, target: exampleTarget }
				),
			},
			{
				label: __( 'The matching page' ),
				value: 'true',
				description: sprintf(
					/* translators: %(source)s is the forwarded domain name, %(target)s is the destination URL. */
					__( '%(source)s/prices goes to %(target)s/prices.' ),
					{ source: exampleSource, target: exampleTarget }
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
						label: __( 'Domain' ),
						value: 'root',
					},
					{
						label: __( 'Subdomain' ),
						value: '',
					},
				],
				isVisible: () => {
					return ! forceSubdomain;
				},
			},
			{
				id: 'subdomain',
				label: forceSubdomain ? __( 'Subdomain' ) : __( 'Source URL' ),
				placeholder: __( 'blog' ),
				type: 'text' as const,
				Edit: ( { field, data, onChange, markWhenOptional } ) => {
					const { id, getValue } = field;
					const isDisabled = data.sourceType !== '';
					const suffix = isDisabled ? '' : `.${ domainName }`;
					const value = getValue( { item: data } );
					const validationMessage = field.isValid?.custom?.( data, field );

					return (
						<SuffixInputControl
							required={ !! field.isValid?.required }
							markWhenOptional={ markWhenOptional }
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
						// Only validate subdomain when in subdomain mode
						if ( item.sourceType === 'root' ) {
							return null;
						}
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
				label: __( 'Forward to' ),
				placeholder: 'https://example.com',
				description: __( 'The full address visitors should land on.' ),
				type: 'text',
				isValid: {
					required: true,
					custom: ( item ) => {
						const sourceWithSubdomain = item.subdomain
							? `${ item.subdomain }.${ domainName }`
							: domainName;
						const sourceDomain = item.sourceType === 'root' ? domainName : sourceWithSubdomain;
						const validationError = isTargetUrlValid( item.targetUrl, sourceDomain );
						if ( validationError !== null ) {
							return validationError;
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
		<div ref={ ref }>
			<form onSubmit={ handleSubmit }>
				<Card>
					<CardBody>
						<DataForm< FormData >
							data={ formData }
							fields={ fields }
							validity={ validity }
							form={ currentForm }
							onChange={ ( edits: Partial< FormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
					</CardBody>
					<PanelBody
						className="domain-forwarding-form-options"
						title={ getForwardingSummary( formData.isPermanent, formData.forwardPaths ) }
						initialOpen={ hasNonDefaultAdvancedValues }
					>
						<PanelRow>
							<VStack spacing={ 6 }>
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
					<CardBody>
						<ButtonStack justify="start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ isSubmitting }
								__next40pxDefaultSize
							>
								{ submitButtonText }
							</Button>
						</ButtonStack>
					</CardBody>
				</Card>
			</form>
		</div>
	);
}
