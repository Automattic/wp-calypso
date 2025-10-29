import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Fragment } from 'react';
import { Card, CardBody, CardDivider } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { Text } from '../../components/text';
import type {
	AutomatedTransferEligibilityWarning,
	AutomatedTransferEligibilityWarningDomainNames,
} from '@automattic/api-core';

function splitDomainName( domainName: string ) {
	const parts = domainName.split( '.' );
	const first = parts.shift();
	const rest = '.' + parts.join( '.' );
	return { first, rest };
}

function DomainNames( { names }: { names: AutomatedTransferEligibilityWarningDomainNames } ) {
	const items = [
		{
			label: splitDomainName( names.current ),
			badgeLabel: __( 'current' ),
			badgeIntent: 'default' as const,
		},
		{
			label: splitDomainName( names.new ),
			badgeLabel: __( 'new' ),
			badgeIntent: 'success' as const,
		},
	];

	return (
		<VStack>
			<Card size="small">
				{ items.map( ( item, index ) => (
					<Fragment key={ index }>
						<CardBody>
							<HStack>
								<HStack justify="flex-start" spacing={ 0 } expanded={ false }>
									<Text
										as="span"
										style={ {
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										} }
									>
										{ item.label.first }
									</Text>
									<Text as="span" style={ { flexShrink: 0 } }>
										{ item.label.rest }
									</Text>
								</HStack>
								<Badge intent={ item.badgeIntent } style={ { flexShrink: 0 } }>
									{ item.badgeLabel }
								</Badge>
							</HStack>
						</CardBody>
						{ index < items.length - 1 && <CardDivider /> }
					</Fragment>
				) ) }
			</Card>
		</VStack>
	);
}

export function WarningContentInfo( {
	warnings,
}: {
	warnings: AutomatedTransferEligibilityWarning;
} ) {
	return (
		<VStack>
			{ Object.keys( warnings ).map( ( type ) => {
				const warningsByType = warnings[ type as keyof AutomatedTransferEligibilityWarning ];
				if ( ! warningsByType.length ) {
					return null;
				}

				return warningsByType.map( ( warning ) => (
					<VStack key={ warning.id } spacing={ 6 }>
						<Text>
							<span
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={ { __html: warning.description } }
							/>
							{ warning.support_url && (
								<>
									{ ' ' }
									<InlineSupportLink
										supportLink={ warning.support_url }
										supportPostId={ warning.support_post_id }
									>
										{ __( 'Learn more' ) }
									</InlineSupportLink>
								</>
							) }
						</Text>
						{ warning.domain_names && <DomainNames names={ warning.domain_names } /> }
					</VStack>
				) );
			} ) }
		</VStack>
	);
}
