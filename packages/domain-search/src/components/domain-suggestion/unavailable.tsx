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
import { DomainSuggestionsList, useDomainSuggestionsListContext } from '../domain-suggestions-list';

import './unavailable.scss';

export interface UnavailableProps {
	domain: string;
	tld: string;
	getReasonText: ( { domain }: { domain: React.ReactElement } ) => React.ReactNode;
	onTransferClick?(): void;
}

const UnavailableComponent = ( {
	domain,
	tld,
	getReasonText,
	onTransferClick,
}: UnavailableProps ) => {
	const listContext = useDomainSuggestionsListContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestion must be used within a DomainSuggestionsList' );
	}

	const { activeQuery } = listContext;

	const { __ } = useI18n();

	const reason = (
		<Text size={ activeQuery === 'large' ? 18 : 16 }>
			{ getReasonText( {
				domain: (
					<Text size="inherit" aria-label={ `${ domain }.${ tld }` }>
						{ domain }
						<Text size="inherit" weight={ 500 }>
							.{ tld }
						</Text>
					</Text>
				),
			} ) }
		</Text>
	);

	const onTransfer = onTransferClick && (
		<div
			style={ {
				marginLeft: activeQuery === 'large' ? 'auto' : undefined,
				textAlign: activeQuery === 'large' ? 'right' : 'left',
			} }
		>
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
					<Icon icon={ notAllowed } size={ 24 } style={ { flexShrink: 0 } } />
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
		<Card size={ activeQuery === 'large' ? 'medium' : 'small' }>
			<CardBody style={ { borderRadius: 0 } } isShady>
				{ getContent() }
			</CardBody>
		</Card>
	);
};

export const Unavailable = ( props: UnavailableProps ) => {
	const listContext = useDomainSuggestionsListContext();

	if ( ! listContext ) {
		return (
			<DomainSuggestionsList>
				<UnavailableComponent { ...props } />
			</DomainSuggestionsList>
		);
	}

	return <UnavailableComponent { ...props } />;
};
