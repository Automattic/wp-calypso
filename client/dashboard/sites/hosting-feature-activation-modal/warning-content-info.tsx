import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
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
			intent: 'none' as const,
		},
		{
			label: splitDomainName( names.new ),
			badgeLabel: __( 'new' ),
			intent: 'stable' as const,
		},
	];

	return (
		<VStack spacing={ 2 } className="hosting-feature-activation-modal__domains">
			{ items.map( ( item, index ) => (
				<HStack key={ index } className="hosting-feature-activation-modal__domain">
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
					<Badge intent={ item.intent } style={ { flexShrink: 0 } }>
						{ item.badgeLabel }
					</Badge>
				</HStack>
			) ) }
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
							{ /* Wrap in span; avoids a Google Translate DOM crash (react/react#11538) */ }
							{ warning.domain_names ? (
								<span>
									{ createInterpolateElement(
										__(
											'<strong>Your site’s address will change</strong> to the one below. Links to your old address will redirect automatically.'
										),
										{ strong: <strong /> }
									) }
								</span>
							) : (
								<span
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={ { __html: warning.description } }
								/>
							) }
							{ warning.support_url && (
								<>
									{ ' ' }
									<InlineSupportLink
										supportLink={ warning.support_url }
										supportPostId={ warning.support_post_id }
									>
										{ __( 'Learn more' ) }
									</InlineSupportLink>
									.
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
