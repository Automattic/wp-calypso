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
	cta?: React.ReactNode;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

const ICON_SIZE = 24;

const DomainSuggestionComponent = ( {
	uuid,
	domain,
	tld,
	price,
	badges,
	notice,
	onClick,
	disabled,
	cta,
}: DomainSuggestionProps ) => {
	const listContext = useDomainSuggestionContainerContext();

	if ( ! listContext ) {
		throw new Error( 'DomainSuggestion must be used within a DomainSuggestionsList' );
	}

	const { activeQuery } = listContext;

	const domainName = (
		<Text
			size={ activeQuery === 'large' ? 18 : 16 }
			className="domain-suggestions-list-item__domain-name-container"
		>
			<span
				aria-label={ `${ domain }.${ tld }` }
				className="domain-suggestions-list-item__domain-name"
			>
				{ domain }
				<Text
					size="inherit"
					lineHeight="inherit"
					weight={ 500 }
					className="domain-suggestions-list-item__domain-name-tld"
				>
					.{ tld }
				</Text>
				{ notice && (
					<>
						<span
							aria-hidden="true"
							style={ {
								marginRight: activeQuery === 'large' ? '8px' : '4px',
							} }
						/>
						<span className="domain-suggestions-list-item__notice">
							<DomainSuggestionPopover>{ notice }</DomainSuggestionPopover>
						</span>
					</>
				) }
			</span>
			{ badges && <span className="domain-suggestions-list-item__badges">{ badges }</span> }
		</Text>
	);

	const domainNameElement =
		activeQuery === 'large' ? (
			<HStack alignment="left" spacing={ 3 }>
				<Icon icon={ globe } size={ ICON_SIZE } className="domain-suggestions-list-item__icon" />
				<span style={ { lineHeight: `${ ICON_SIZE }px` } }>{ domainName }</span>
			</HStack>
		) : (
			domainName
		);

	return (
		<SuggestionSkeleton
			domainName={ domainNameElement }
			price={ price }
			cta={ cta ?? <DomainSuggestionCTA onClick={ onClick } uuid={ uuid } disabled={ disabled } /> }
		/>
	);
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
