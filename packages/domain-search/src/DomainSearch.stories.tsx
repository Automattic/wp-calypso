import { Step } from '@automattic/onboarding';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useState } from 'react';
import type { Meta } from '@storybook/react';

export const Default = () => {
	const [ initialQuery, setInitialQuery ] = useState( '' );

	return initialQuery ? (
		<DomainSearchResults initialQuery={ initialQuery } />
	) : (
		<DomainSearch onSearch={ ( query ) => setInitialQuery( query ) } />
	);
};

const meta: Meta< typeof Default > = {
	title: 'DomainSearch',
	component: Default,
};

export default meta;

function DomainSearch( { onSearch }: { onSearch( query: string ): void } ) {
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
					<input onChange={ ( e ) => setQuery( e.target.value ) } value={ query } />
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
		<>
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
							leftElement={ <Text>3 domains</Text> }
							rightElement={
								<HStack spacing={ 2 }>
									<Button variant="tertiary">View cart</Button>
									<Button onClick={ () => {} } variant="primary">
										Continue
									</Button>
								</HStack>
							}
						/>
					);
				} }
			>
				{ initialQuery }
			</Step.CenteredColumnLayout>
		</>
	);
}
