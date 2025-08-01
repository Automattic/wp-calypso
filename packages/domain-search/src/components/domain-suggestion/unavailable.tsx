import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { Icon, notAllowed } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionsList } from '../domain-suggestions-list';

import './unavailable.scss';

export interface UnavailableProps {
	domain?: string;
	tld: string;
	reason: 'tld-not-supported' | 'tld-not-supported-temporarily' | 'already-registered';
	onTransferClick?(): void;
	transferLink?: string;
}

const ICON_SIZE = 24;

const UnavailableComponent = ( {
	domain,
	tld,
	reason,
	onTransferClick,
	transferLink,
}: UnavailableProps ) => {
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestion must be used within a DomainSuggestionsList' );
	}

	const { activeQuery } = listContext;

	const { __ } = useI18n();

	const reasonText = useMemo( () => {
		const styledTld = (
			<Text size="inherit" weight={ 500 } lineHeight="inherit" style={ { whiteSpace: 'nowrap' } }>
				.{ tld }
			</Text>
		);

		const styledDomain = (
			<Text
				size="inherit"
				lineHeight="inherit"
				aria-label={ `${ domain }.${ tld }` }
				style={ { wordBreak: 'break-all' } }
			>
				{ domain }
				{ styledTld }
			</Text>
		);

		if ( reason === 'tld-not-supported' ) {
			return createInterpolateElement(
				__( '<tld /> domains are not available for registration on WordPress.com.' ),
				{
					tld: styledTld,
				}
			);
		}

		if ( reason === 'tld-not-supported-temporarily' ) {
			return createInterpolateElement(
				__(
					'<tld /> domains are temporarily not offered on WordPress.com. Please try again later or choose a different extension.'
				),
				{
					tld: styledTld,
				}
			);
		}

		if ( reason === 'already-registered' ) {
			return createInterpolateElement( __( '<domain /> is already registered.' ), {
				domain: styledDomain,
			} );
		}
	}, [ reason, domain, tld, __ ] );

	if ( ! reasonText ) {
		throw new Error( `Unknown reason: ${ reason }` );
	}

	const reasonElement = (
		<Text size={ activeQuery === 'large' ? 18 : 16 } lineHeight="inherit">
			{ reasonText }
		</Text>
	);

	const onTransfer = ( onTransferClick || transferLink ) && (
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
							href={ transferLink }
						/>
					),
				} ) }
			</Text>
		</div>
	);

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<HStack alignment="left" spacing={ 6 }>
					<HStack alignment="left" spacing={ 3 } style={ { width: 'auto' } }>
						<Icon
							icon={ notAllowed }
							size={ ICON_SIZE }
							className="domain-suggestions-list-item__icon"
						/>
						<span style={ { lineHeight: `${ ICON_SIZE }px` } }>{ reasonElement }</span>
					</HStack>
					{ onTransfer }
				</HStack>
			);
		}

		return (
			<VStack spacing={ 3 }>
				{ reasonElement }
				{ onTransfer }
			</VStack>
		);
	};

	return (
		<Card
			size={ activeQuery === 'large' ? 'medium' : 'small' }
			className="domain-suggestions-list-item-unavailable"
		>
			<CardBody style={ { borderRadius: 0 } } isShady>
				{ getContent() }
			</CardBody>
		</Card>
	);
};

export const Unavailable = ( props: UnavailableProps ) => {
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		return (
			<DomainSuggestionsList>
				<UnavailableComponent { ...props } />
			</DomainSuggestionsList>
		);
	}

	return <UnavailableComponent { ...props } />;
};
