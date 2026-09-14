import { formatCurrency } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { Text } from '../../../components/text';
import GoogleLogo from '../../../images/google-logo.svg';
import { IntervalLength } from '../../types';
import type { Product } from '@automattic/api-core';

export function GoogleWorkspaceCard( {
	product,
	interval,
	available,
	hasFreeTrial,
	onSelect,
}: {
	product?: Product;
	interval: IntervalLength;
	available: boolean;
	hasFreeTrial: boolean;
	onSelect: () => void;
} ) {
	const [ showFeatures, setShowFeatures ] = useState( false );
	const featuresId = useInstanceId( GoogleWorkspaceCard, 'google-workspace-features' );

	// Placeholder feature list, final copy pending (DOTEMP-111).
	const features = [
		__( 'Send and receive from your custom domain' ),
		__( '30 GB storage' ),
		__( 'Email, calendar, and contacts' ),
		__( 'Video calls, docs, spreadsheets, and more' ),
		__( 'Real-time collaboration' ),
		__( 'Store and share files in the cloud' ),
		__( '24/7 support via email' ),
	];

	const name = product?.product_name ?? __( 'Google Workspace' );
	const price = formatCurrency( product?.cost ?? 0, product?.currency_code ?? 'USD', {
		stripZeros: true,
	} );

	return (
		<Card>
			<CardBody>
				<HStack alignment="topLeft" justify="flex-start" spacing={ 4 } style={ { minWidth: 0 } }>
					<img src={ GoogleLogo } alt="" width={ 30 } height={ 30 } />
					<VStack spacing={ 2 } justify="flex-start" style={ { minWidth: 0, flex: 1 } }>
						<Text as="h2" size={ 16 } weight={ 600 }>
							{ name }
						</Text>
						<HStack alignment="center" justify="space-between" spacing={ 4 }>
							<HStack
								justify="flex-start"
								spacing={ 1 }
								expanded={ false }
								style={ { minWidth: 0 } }
							>
								<Text>
									{ __(
										'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
									) }
								</Text>
								<Button
									size="small"
									label={ showFeatures ? __( 'Hide features' ) : __( 'Show features' ) }
									icon={ showFeatures ? chevronUp : chevronDown }
									aria-expanded={ showFeatures }
									aria-controls={ featuresId }
									onClick={ () => setShowFeatures( ! showFeatures ) }
								/>
							</HStack>
							<Button
								__next40pxDefaultSize
								className="google-workspace-card-action"
								variant="secondary"
								disabled={ ! available }
								onClick={ onSelect }
								style={ { flexShrink: 0 } }
							>
								{ __( 'Get Google Workspace' ) }
							</Button>
						</HStack>
						{ showFeatures && (
							<ul id={ featuresId } className="email-provider-features">
								{ features.map( ( feature, featureIndex ) => (
									<li key={ `feature-google-${ featureIndex }` }>{ feature }</li>
								) ) }
							</ul>
						) }
						<HStack justify="flex-start" spacing={ 1 } expanded={ false }>
							<Text size={ 16 } weight={ 600 }>
								{ price }
							</Text>
							<Text variant="muted">
								{ interval === IntervalLength.Annually ? __( '/year' ) : __( '/month' ) }
							</Text>
						</HStack>
						{ ! available && (
							<Text variant="muted">{ __( 'Not available for this domain name.' ) }</Text>
						) }
						{ available && hasFreeTrial && (
							<div className="email-provider-trial">{ __( '3 month free trial' ) }</div>
						) }
					</VStack>
				</HStack>
			</CardBody>
		</Card>
	);
}
