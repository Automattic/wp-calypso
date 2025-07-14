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
import { useContainerQuery } from '../../hooks/use-container-query';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';

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
	activeQuery,
	isWithinList,
}: UnavailableProps & { activeQuery: 'small' | 'large'; isWithinList: boolean } ) => {
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
		<Card isBorderless={ isWithinList } size={ activeQuery === 'large' ? 'medium' : 'small' }>
			<CardBody style={ { borderRadius: 0 } } isShady={ isWithinList }>
				{ getContent() }
			</CardBody>
		</Card>
	);
};

const StandaloneUnavailable = ( props: UnavailableProps ) => {
	const { ref: containerRef, activeQuery } = useContainerQuery( {
		small: 0,
		large: 480,
	} );

	return (
		<div ref={ containerRef }>
			<UnavailableComponent { ...props } activeQuery={ activeQuery } isWithinList={ false } />
		</div>
	);
};

export const Unavailable = ( props: UnavailableProps ) => {
	const listContext = useDomainSuggestionsListContext();

	if ( ! listContext ) {
		return <StandaloneUnavailable { ...props } />;
	}

	return <UnavailableComponent { ...props } activeQuery={ listContext.activeQuery } isWithinList />;
};
