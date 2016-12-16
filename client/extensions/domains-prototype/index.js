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
import Checkout from 'my-sites/upgrades/checkout';
import CheckoutData from 'components/data/checkout';
import Main from 'components/main';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import RegisterDomainStep from 'components/domains/register-domain-step';
import route from 'lib/route';
import SectionHeader from 'components/section-header';
import { setSection } from 'state/ui/actions';

/**
 * Module variables
 */
const productsList = productsFactory();

const onAddDomain = ( suggestion ) => {
	page( '/domains-prototype/select/' + suggestion.domain_name );
};

const header = ( text ) => {
	return ( <SectionHeader label={ text }>🐬</SectionHeader> );
};

const search = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore(
		(
			<Main className="">
				{ header( 'Look for a web address' ) }
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
				}
			</Main>
		),
		document.getElementById( 'primary' ),
		context.store
	);
};

const select = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			{ header( 'You have selected ' + context.params.domainName ) }
			<Card>
				You selected { context.params.domainName }.
				This screen is redundant
			</Card>
			<Button primary href={ '/domains-prototype/checkout/' + context.params.domainName }>Buy now</Button>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const manage = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			{ header( 'Manage your addresses' ) }
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
			{ header( 'Manage ' + context.params.domainName ) }
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

const success = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main className="">
			{ header( 'You now own ' + context.params.domainName ) }
			<Card>
				<ButtonGroup>
					<Button compact href="/domains-prototype">Search again</Button>
					<Button compact href="/domains-prototype/manage">Manage all domains</Button>
					<Button compact href={ '/domains-prototype/manage/' + context.params.domainName }>Manage { context.params.domainName }</Button>
				</ButtonGroup>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const checkout = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore(
		(
			<CheckoutData>
				<Checkout
					product={ context.params.product }
					productsList={ productsList }
					selectedFeature={ context.params.feature }
				/>
			</CheckoutData>
		),
		document.getElementById( 'primary' ),
		context.store
	);
};

export default function() {
	page( '/domains-prototype/select/:domainName?', select );
	page( '/domains-prototype/manage', manage );
	page( '/domains-prototype/manage/:domainName?', manageDomain );
	page( '/domains-prototype/checkout/:domainName?', checkout );
	page( '/domains-prototype/success/:domainName?', success );
	page( '/domains-prototype/', search );
}
