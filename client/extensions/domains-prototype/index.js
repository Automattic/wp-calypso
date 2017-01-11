/**
 * External dependencies
 */
import noop from 'lodash/noop';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button';
import Card from 'components/card';
import Main from 'components/main';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import RegisterDomainStep from 'components/domains/register-domain-step';
import route from 'lib/route';
import SearchCard from 'components/search-card';
import SectionHeader from 'components/section-header';
import { setSection } from 'state/ui/actions';

/**
 * Module variables
 */
const productsList = productsFactory();

const render = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			<SectionHeader label="Domain Name Search">🐬</SectionHeader>
			<SearchCard
				onSearch={ noop }
				placeholder="Enter a domain or keyword"
			/>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const onAddDomain = ( suggestion ) => {
	page( '/domains-prototype/select/' + suggestion.domain_name );
};

const search = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore(
		(
			<RegisterDomainStep
				path={ context.path }
				suggestion={ context.params.suggestion }
				domainsWithPlansOnly={ false }
				onDomainsAvailabilityChange={ noop }
				onAddDomain={ onAddDomain }
				selectedSite={ null }
				offerMappingOption
				basePath={ route.sectionify( context.path ) }
				products={ productsList.get() } />
		),
		document.getElementById( 'primary' ),
		context.store
	);
};

const select = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			<SectionHeader label="Domain Name Select">🐬</SectionHeader>
			<Card>You selected { context.params.domainName }</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const manage = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			<SectionHeader label="Manage your domains">🐬</SectionHeader>
			<Card>
				domain1.blog
				<Button href="/domains-prototype/manage/domain1.blog" primary>Set up</Button>
			</Card>
			<Card>
				domain2.blog
				<Button href="/domains-prototype/manage/domain2.blog" primary>Set up</Button>
			</Card>
			<Card>
				domain3.blog
				<Button href="/domains-prototype/manage/domain3.blog" primary>Set up</Button>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const manageDomain = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			<SectionHeader label={ 'Manage ' + context.params.domainName }>🐬</SectionHeader>
			<Card>
				<ButtonGroup>
					<Button compact href="">Change name servers</Button>
					<Button compact href="">Edit DNS</Button>
					<Button compact href="" primary>Connect to WordPress.com</Button>
				</ButtonGroup>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/domains-prototype/search', search );
	page( '/domains-prototype/select/:domainName', select );
	page( '/domains-prototype/manage', manage );
	page( '/domains-prototype/manage/:domainName', manageDomain );
	page( '/domains-prototype/', render );
}
