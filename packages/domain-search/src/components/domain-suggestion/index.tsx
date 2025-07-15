import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { globe, Icon } from '@wordpress/icons';
import { ComponentProps } from 'react';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionPopover } from '../domain-suggestion-popover';
import { useDomainSuggestionsListContext } from '../domain-suggestions-list';
import { Unavailable } from './unavailable';

import './style.scss';

type DomainSuggestionProps = {
	uuid: string;
	domain: string;
	tld: string;
	price: React.ReactNode;
	badges?: React.ReactNode;
	notice?: React.ReactNode;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' >;

export const DomainSuggestion = ( {
	uuid,
	domain,
	tld,
	price,
	badges,
	notice,
	onClick,
}: DomainSuggestionProps ) => {
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
					lineHeight: 'inherit',
					marginRight: badges ? '12px' : undefined,
				} }
			>
				<span
					aria-label={ `${ domain }.${ tld }` }
					style={ {
						wordBreak: 'break-all',
						// eslint-disable-next-line no-nested-ternary
						marginRight: notice ? ( activeQuery === 'large' ? '8px' : '4px' ) : undefined,
					} }
				>
					{ domain }
					<Text size="inherit" weight={ 500 }>
						.{ tld }
					</Text>
				</span>
				{ notice && (
					<span className="domain-suggestions-list-item__notice">
						<DomainSuggestionPopover>{ notice }</DomainSuggestionPopover>
					</span>
				) }
			</Text>
			{ badges && <span className="domain-suggestions-list-item__badges">{ badges }</span> }
		</span>
	);

	const cta = <DomainSuggestionCTA onClick={ onClick } compact uuid={ uuid } />;

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
