import { Step } from '@automattic/onboarding';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from 'react';
import { buildDomainSearchCart } from './test-helpers/factories';
import {
	DomainSearch,
	DomainSearchControls,
	DomainsFullCart,
	DomainsMiniCart,
	DomainSuggestionsList,
} from '.';
import type { Meta } from '@storybook/react';

export const Default = () => {
	const [ initialQuery, setInitialQuery ] = useState( 'mycoolsite.com' );

	return initialQuery ? (
		<DomainSearchResults initialQuery={ initialQuery } />
	) : (
		<DomainSearchEmptyState onSearch={ ( query ) => setInitialQuery( query ) } />
	);
};

const meta: Meta< typeof Default > = {
	title: 'DomainSearch',
	component: Default,
};

export default meta;

function DomainSearchEmptyState( { onSearch }: { onSearch( query: string ): void } ) {
	const [ query, setQuery ] = useState( '' );

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 10 }
			heading={
				<Step.Heading
					text="Claim your space on the web"
					subText="Make it yours with a .com, .blog, or one of 350+ domain options."
				/>
			}
			verticalAlign="center"
		>
			<form
				onSubmit={ ( e ) => {
					e.preventDefault();
					onSearch( query );
				} }
			>
				<HStack alignment="flex-start" spacing={ 4 }>
					<DomainSearchControls.Input
						onChange={ ( value ) => setQuery( value ) }
						value={ query }
						onReset={ () => {} }
						label="Search for a domain"
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={ false }
						minLength={ 1 }
						maxLength={ 253 }
						dir="ltr"
						aria-describedby="domain-search-description"
						onBlur={ () => {} }
					/>
					<Button __next40pxDefaultSize type="submit" variant="primary">
						Search domains
					</Button>
				</HStack>
			</form>
		</Step.CenteredColumnLayout>
	);
}

function DomainSearchResults( { initialQuery }: { initialQuery: string } ) {
	return (
		<DomainSearch
			cart={ buildDomainSearchCart() }
			initialQuery={ initialQuery }
			onContinue={ () => {
				alert( 'go to checkout' );
			} }
		>
			<Step.CenteredColumnLayout
				columnWidth={ 8 }
				heading={
					<Step.Heading
						text="Claim your space on the web"
						subText="Make it yours with a .com, .blog, or one of 350+ domain options."
					/>
				}
				stickyBottomBar={ () => {
					return (
						<Step.StickyBottomBar
							leftElement={ <DomainsMiniCart.Summary /> }
							rightElement={ <DomainsMiniCart.Actions /> }
						/>
					);
				} }
			>
				<VStack spacing={ 8 }>
					<HStack spacing={ 4 }>
						<DomainSearchControls.Input
							value={ initialQuery }
							onChange={ () => {} }
							onReset={ () => {} }
							label="Search for a domain"
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus={ false }
							minLength={ 1 }
							maxLength={ 253 }
							dir="ltr"
							aria-describedby="domain-search-description"
							onBlur={ () => {} }
						/>
						<DomainSearchControls.FilterButton count={ 3 } onClick={ () => {} } />
					</HStack>

					<HStack spacing={ 4 }>TODO Recommendations</HStack>
					<DomainSuggestionsList>TODO</DomainSuggestionsList>
				</VStack>
			</Step.CenteredColumnLayout>
			<DomainsFullCart />
		</DomainSearch>
	);
}
