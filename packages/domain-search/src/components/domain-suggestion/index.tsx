import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { globe, Icon } from '@wordpress/icons';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';
import { Unavailable } from './unavailable';

import './style.scss';

interface DomainSuggestionProps {
	uuid: string;
	domain: string;
	tld: string;
	price: React.ReactNode;
	badges?: React.ReactNode;
}

export const DomainSuggestion = ( { uuid, domain, tld, price, badges }: DomainSuggestionProps ) => {
	const listContext = useDomainSuggestionsListContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestion must be used within a DomainSuggestionsList' );
	}

	const { activeQuery } = listContext;

	const domainName = (
		<span style={ { lineHeight: '24px' } }>
			<Text
				size={ activeQuery === 'large' ? 18 : 16 }
				style={ {
					verticalAlign: 'middle',
					marginRight: badges ? '12px' : undefined,
				} }
				aria-label={ `${ domain }.${ tld }` }
			>
				{ domain }
				<Text size="inherit" weight={ 500 }>
					.{ tld }
				</Text>
			</Text>
			{ badges && <span className="domain-suggestions-list-item__badges">{ badges }</span> }
		</span>
	);

	const cta = <DomainSuggestionCTA compact uuid={ uuid } />;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<HStack spacing={ 3 }>
					<HStack alignment="left" spacing={ 3 }>
						<Icon icon={ globe } size={ 24 } style={ { flexShrink: 0 } } />
						{ domainName }
					</HStack>

					<HStack alignment="right" spacing={ 4 }>
						{ price }
						{ cta }
					</HStack>
				</HStack>
			);
		}

		return (
			<HStack spacing={ 4 }>
				<VStack spacing={ 2 }>
					{ domainName }
					{ price }
				</VStack>
				{ cta }
			</HStack>
		);
	};

	return (
		<Card isBorderless size={ activeQuery === 'large' ? 'medium' : 'small' }>
			<CardBody>{ getContent() }</CardBody>
		</Card>
	);
};

DomainSuggestion.Unavailable = Unavailable;
