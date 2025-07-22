import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { globe, Icon } from '@wordpress/icons';
import { ComponentProps } from 'react';
import { useDomainSuggestionContainerContext } from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionPopover } from '../domain-suggestion-popover';
import { DomainSuggestionsList } from '../domain-suggestions-list';
import { Featured } from './featured';
import { SuggestionPlaceholder } from './index.placeholder';
import { SuggestionSkeleton } from './index.skeleton';
import { Unavailable } from './unavailable';

import './style.scss';

type DomainSuggestionProps = {
	uuid: string;
	domain: string;
	tld: string;
	price: React.ReactNode;
	badges?: React.ReactNode;
	notice?: React.ReactNode;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

const DomainSuggestionComponent = ( {
	uuid,
	domain,
	tld,
	price,
	badges,
	notice,
	onClick,
	disabled,
}: DomainSuggestionProps ) => {
	const listContext = useDomainSuggestionContainerContext();

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

	const cta = (
		<DomainSuggestionCTA onClick={ onClick } compact uuid={ uuid } disabled={ disabled } />
	);

	const domainNameElement =
		activeQuery === 'large' ? (
			<HStack alignment="left" spacing={ 3 }>
				<Icon icon={ globe } size={ 24 } style={ { flexShrink: 0 } } />
				{ domainName }
			</HStack>
		) : (
			domainName
		);

	return <SuggestionSkeleton domainName={ domainNameElement } price={ price } cta={ cta } />;
};

export const DomainSuggestion = ( props: DomainSuggestionProps ) => {
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		return (
			<DomainSuggestionsList>
				<DomainSuggestionComponent { ...props } />
			</DomainSuggestionsList>
		);
	}

	return <DomainSuggestionComponent { ...props } />;
};

DomainSuggestion.Unavailable = Unavailable;
DomainSuggestion.Featured = Featured;
DomainSuggestion.Placeholder = SuggestionPlaceholder;
