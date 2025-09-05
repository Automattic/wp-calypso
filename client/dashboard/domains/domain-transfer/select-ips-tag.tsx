import { ipsTagListQuery, ipsTagMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	FormTokenField,
	Modal,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';

interface SelectIpsTagProps {
	domain: string;
	isDomainLocked: boolean;
}

export default function SelectIpsTag( { domain, isDomainLocked }: SelectIpsTagProps ) {
	const { data: ipsTagList } = useSuspenseQuery( ipsTagListQuery() );
	const saveIpsTagMutation = useMutation( ipsTagMutation( domain ) );
	const [ ipsTag, setIpsTag ] = useState< string | null >( null );
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );
	const [ saveStatus, setSaveStatus ] = useState< 'success' | 'error' | '' >( '' );

	const suggestions = ipsTagList.map( ( item ) => item.tag );

	if ( isDomainLocked ) {
		return <Text>{ __( 'The IPS tag cannot be set while the domain is locked.' ) }</Text>;
	}

	const onConfirm = () => {
		if ( ipsTag === null ) {
			return;
		}
		saveIpsTagMutation.mutate( ipsTag, {
			onSuccess: () => {
				setSaveStatus( 'success' );
			},
			onError: () => {
				setSaveStatus( 'error' );
			},
			onSettled: () => {
				setIsDialogOpen( false );
			},
		} );
	};

	const renderDialog = () => {
		const registrar = ipsTagList.find( ( item ) => item.tag === ipsTag );
		return (
			<Modal
				title={ __( 'Transfer Confirmation' ) }
				onRequestClose={ () => setIsDialogOpen( false ) }
			>
				<VStack spacing={ 6 }>
					<Text>
						{ createInterpolateElement(
							__( 'Please verify you wish to set the registrar for <domain/> to the following:' ),
							{
								domain: <strong>{ domain }</strong>,
							}
						) }
					</Text>
					<Text>
						<strong>{ registrar?.tag }</strong>
						{ registrar?.registrarName && <> ({ registrar?.registrarName })</> }
					</Text>
					<Text>
						{ __(
							'After submitting this tag change, the domain will no longer be in our system. ' +
								'You will need to contact the new registrar to complete the transfer and regain ' +
								'control of the domain.'
						) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button
							onClick={ () => setIsDialogOpen( false ) }
							disabled={ saveIpsTagMutation.isPending }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							isBusy={ saveIpsTagMutation.isPending }
							isDestructive
							onClick={ onConfirm }
							disabled={ saveIpsTagMutation.isPending }
						>
							{ __( 'Submit' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</Modal>
		);
	};

	const renderIpsTagSelect = () => {
		return (
			<>
				<FormTokenField
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label="IPS tag"
					placeholder={ __( 'Start typing an IPS tag…' ) }
					onChange={ ( tokens ) => {
						setIpsTag( tokens.length > 0 ? ( tokens[ tokens.length - 1 ] as string ) : null );
					} }
					displayTransform={ ( item: string ) =>
						`${ item } (${ ipsTagList.find( ( tag ) => tag.tag === item )?.registrarName })`
					}
					suggestions={ suggestions }
					value={ ipsTag ? [ ipsTag ] : [] }
					__experimentalShowHowTo={ false }
				/>
				<Text>
					{ createInterpolateElement(
						__( 'Please enter the IPS tag of the registrar you wish to transfer <domain/> to.' ),
						{
							domain: <strong>{ domain }</strong>,
						}
					) }
				</Text>
				<ButtonStack alignment="left">
					<Button
						__next40pxDefaultSize
						variant="secondary"
						disabled={ ! ipsTag }
						onClick={ () => setIsDialogOpen( true ) }
					>
						{ __( 'Submit' ) }
					</Button>
				</ButtonStack>
			</>
		);
	};

	const renderGoToGainingRegistrar = () => {
		const registrarUrl = ipsTagList.find( ( tag ) => tag.tag === ipsTag )?.registrarUrl;

		return (
			<Notice variant="success" title={ __( 'Transfer successful' ) }>
				<Text>
					{ registrarUrl
						? __( 'Success! Please visit your new registrar to complete the transfer.' )
						: __( 'Success! Contact your new registrar to complete the transfer.' ) }
					{ registrarUrl && (
						<>
							{ ' ' }
							<ExternalLink href={ registrarUrl }>{ __( 'Open' ) }</ExternalLink>
						</>
					) }
				</Text>
			</Notice>
		);
	};

	return (
		<>
			{ saveStatus === 'success' ? renderGoToGainingRegistrar() : renderIpsTagSelect() }
			{ isDialogOpen && renderDialog() }
		</>
	);
}
