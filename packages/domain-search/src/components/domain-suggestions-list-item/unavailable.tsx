import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, notAllowed } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';

import './unavailable.scss';

export interface UnavailableProps {
	domain: string;
	tld: string;
	unavailableReason: 'already-registered';
	onTransferClick?(): void;
}

export const Unavailable = ( {
	domain,
	tld,
	unavailableReason,
	onTransferClick,
}: UnavailableProps ) => {
	const { activeQuery } = useDomainSuggestionsListContext();
	const { __ } = useI18n();

	const reasonText = useMemo( () => {
		if ( unavailableReason === 'already-registered' ) {
			return createInterpolateElement( __( '<domainName /> is already registered.' ), {
				domainName: (
					<Text>
						{ domain }
						<Text weight={ 500 }>.{ tld }</Text>
					</Text>
				),
			} );
		}
	}, [ __, unavailableReason, domain, tld ] );

	const reason = <Text size="body">{ reasonText }</Text>;

	const onTransfer = onTransferClick && (
		<div style={ { marginLeft: activeQuery === 'large' ? 'auto' : undefined } }>
			<Text>
				{ createInterpolateElement( __( 'Already yours? <button>Bring it over</button>' ), {
					button: (
						<Button
							className="domain-suggestions-list-item-unavailable__transfer-button"
							variant="link"
							onClick={ onTransferClick }
						/>
					),
				} ) }
			</Text>
		</div>
	);

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<HStack alignment="left" spacing={ 3 }>
					<Icon icon={ notAllowed } size={ 24 } />
					{ reason }
					{ onTransfer }
				</HStack>
			);
		}

		return (
			<VStack spacing={ 3 }>
				{ reason }
				{ onTransfer }
			</VStack>
		);
	};

	return (
		<Card>
			<CardBody>{ getContent() }</CardBody>
		</Card>
	);
};
