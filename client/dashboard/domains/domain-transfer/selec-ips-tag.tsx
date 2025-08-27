import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	FormTokenField,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ipsTagListQuery } from '../../app/queries/domain-transfer';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

export default function SelectIpsTag( { isDomainLocked }: { isDomainLocked: boolean } ) {
	const { data: ipsTagList } = useSuspenseQuery( ipsTagListQuery() );
	const [ ipsTag, setIpsTag ] = useState< string | TokenItem | null >( null );

	const suggestions = ipsTagList.map( ( item ) => item.tag );

	if ( isDomainLocked ) {
		return <Text>{ __( 'The IPS tag cannot be set while the domain is locked.' ) }</Text>;
	}

	return (
		<>
			<Text>
				{ createInterpolateElement(
					__( 'Please enter the IPS tag of the registrar you wish to transfer <domain/> to.' ),
					{
						domain: <strong>test.uk</strong>,
					}
				) }
			</Text>
			<FormTokenField
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label="IPS tag"
				placeholder={ __( 'Start typing an IPS tag…' ) }
				onChange={ ( tokens ) => {
					setIpsTag( tokens[ tokens.length - 1 ] );
				} }
				displayTransform={ ( item: string ) =>
					`${ item } (${ ipsTagList.find( ( tag ) => tag.tag === item )?.registrarName })`
				}
				suggestions={ suggestions }
				value={ ipsTag ? [ ipsTag ] : [] }
				__experimentalShowHowTo={ false }
			/>
			<HStack alignment="left">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					disabled={ ! ipsTag }
					onClick={ () => {} }
				>
					{ __( 'Submit' ) }
				</Button>
			</HStack>
		</>
	);
}
