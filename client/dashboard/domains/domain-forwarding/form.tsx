import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Panel,
	PanelBody,
	PanelRow,
	RadioControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isTargetUrlValid, isSubdomainValid } from './utils';
import type { DomainForwarding } from '../../data/domain-forwarding';
import type { Field } from '@wordpress/dataviews';

export interface FormData {
	sourceType: 'root' | 'subdomain';
	subdomain: string;
	targetUrl: string;
	redirectType: 'temporary' | 'permanent';
	pathForwarding: 'no' | 'yes';
}

interface DomainForwardingFormProps {
	domainName: string;
	initialData?: DomainForwarding | null;
	onSubmit: ( data: FormData ) => void;
	isSubmitting: boolean;
	submitButtonText: string;
}

export default function DomainForwardingForm( {
	domainName,
	initialData,
	onSubmit,
	isSubmitting,
	submitButtonText,
}: DomainForwardingFormProps ) {
	const [ formData, setFormData ] = useState< FormData >( () => {
		if ( ! initialData ) {
			return {
				sourceType: 'subdomain',
				subdomain: '',
				targetUrl: '',
				redirectType: 'temporary',
				pathForwarding: 'no',
			};
		}
		const protocol = initialData.is_secure ? 'https://' : 'http://';
		return {
			sourceType: initialData.subdomain ? 'subdomain' : 'root',
			subdomain: initialData.subdomain || '',
			targetUrl: `${ protocol }${ initialData.target_host }${ initialData.target_path || '' }`,
			redirectType: initialData.is_permanent ? 'permanent' : 'temporary',
			pathForwarding: initialData.forward_paths ? 'yes' : 'no',
		};
	} );

	const redirectTypeField = {
		id: 'redirectType',
		label: __( 'HTTP Redirect Type' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Temporary redirect (307)' ),
				value: 'temporary',
				description: __( 'Enables quick propagation of changes to your forwarding address.' ),
			},
			{
				label: __( 'Permanent redirect (301)' ),
				value: 'permanent',
				description: __(
					'Enables browser caching of the forwarding address for quicker resolution. Note that changes might take longer to fully propagate.'
				),
			},
		],
	};
	const pathForwardingField = {
		id: 'pathForwarding',
		label: __( 'Path forwarding' ),
		type: 'text' as const,
		Edit: 'radio',
		elements: [
			{
				label: __( 'Do not forward' ),
				value: 'no',
			},
			{
				label: __( 'Forward path' ),
				value: 'yes',
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
				label: __( 'Source URL' ),
				type: 'text' as const,
				Edit: 'select',
				elements: [
					{
						label: `${ domainName } subdomain`,
						value: 'subdomain',
					},
					{
						label: `${ domainName } root domain`,
						value: 'root',
					},
				],
			},
			{
				id: 'subdomain',
				label: __( 'Subdomain' ),
				help: __( 'Enter the subdomain (e.g., "blog")' ),
				type: 'text' as const,
				isValid: {
					custom: ( item ) => {
						if ( ! isSubdomainValid( item.subdomain ) ) {
							return __(
								'Subdomain should be a valid domain label - up to 63 characters, starting with a letter or number, and containing only letters, numbers, and hyphens.'
							);
						}
						return null;
					},
				},
				isVisible: ( item: FormData ) => {
					return item.sourceType === 'subdomain';
				},
			},
			{
				id: 'targetUrl',
				label: __( 'Target URL' ),
				help: __( 'The URL to redirect to (e.g., https://example.com/path)' ),
				type: 'text',
				isValid: {
					custom: ( item ) => {
						if ( ! isTargetUrlValid( item.targetUrl, domainName ) ) {
							return __( 'Please enter a valid URL.' );
						}
						return null;
					},
				},
			},
		],
		[ domainName ]
	);

	const form = {
		type: 'regular' as const,
		fields: [ 'sourceType', 'subdomain', 'targetUrl' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit( formData );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<DataForm< FormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< FormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>

						<Panel>
							<PanelBody title={ __( 'Advanced settings' ) } initialOpen={ false }>
								<PanelRow>
									<VStack spacing={ 6 }>
										<RadioControl
											label={ redirectTypeField.label }
											selected={ formData.redirectType }
											options={ redirectTypeField.elements }
											onChange={ ( value: string ) => {
												setFormData( ( data ) => ( {
													...data,
													redirectType: value as 'temporary' | 'permanent',
												} ) );
											} }
										/>
										<RadioControl
											label={ pathForwardingField.label }
											selected={ formData.pathForwarding }
											options={ pathForwardingField.elements }
											onChange={ ( value: string ) => {
												setFormData( ( data ) => ( {
													...data,
													pathForwarding: value as 'no' | 'yes',
												} ) );
											} }
										/>
									</VStack>
								</PanelRow>
							</PanelBody>
						</Panel>

						<HStack justify="start" spacing={ 4 }>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ isSubmitting }
							>
								{ submitButtonText }
							</Button>
						</HStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}

export type { FormData };
