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
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import { navigation, siteSelection } from 'my-sites/controller';
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
			<Main>
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
		<Main>
			{ header( 'You have selected ' + context.params.domainName ) }
			<Card>
				You selected { context.params.domainName }.
				This screen is redundant
			</Card>
			<Button primary href={ '/domains-prototype/checkout/' + context.params.domainName }>Buy now</Button>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const success = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	renderWithReduxStore( (
		<Main>
			{ header( 'You now own ' + context.params.domainName ) }
			<Card>
				<ButtonGroup>
					<Button compact href="/domains-prototype">Search again</Button>
					<Button compact href="/domains-prototype/manage">Manage all domains</Button>
					<Button compact href={ '/domains-prototype/manage/' + context.params.domainName }>
						Manage { context.params.domainName }
					</Button>
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

const getManageScreen = ( domain ) => {
	if ( ! domain ) {
		return (
			<Main>
				<h2>Select a domain</h2>
			</Main>
		);
	}

	return (
		<Main>
			<h2>What do you want to use { domain } for?</h2>
			<Card>
				<h3>Landing page</h3>
				<Button href={ '/domains-prototype/manage/landing-page/' + domain } primary>
					<Gridicon icon="house" /> Edit
				</Button>
			</Card>
			<Card>
				<h3>Start a site</h3>
				<Button href={ '/domains-prototype/manage/start/' + domain } primary>
					<Gridicon icon="add" /> Get started
				</Button>
			</Card>
			<Card>
				<h3>Connect to existing site</h3>
				<Button href={ '/domains-prototype/manage/connect/' + domain } primary>
					<Gridicon icon="plugins" /> Connect
				</Button>
			</Card>
			<Card>
				<h3>Add email</h3>
				<Button href={ '/domains-prototype/manage/email/' + domain } primary>
					<Gridicon icon="mention" /> Set up email
				</Button>
			</Card>
			<Card>
				<h3>Something else</h3>
				<Button href={ '/domains-prototype/manage/settings/' + domain } primary>
					<Gridicon icon="cog" /> Configure settings
				</Button>
			</Card>
		</Main>
	);
};

const manage = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( getManageScreen( domain ), document.getElementById( 'primary' ), context.store );
};

const landingPage = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>{ domain } Set up landing page</h2>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const start = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>Start a site</h2>
			<Card>
				<h3>What type site will { domain } be?</h3>
				<Button href={ '/domains-prototype/manage/start/hosts/blog/' + domain }>A blog</Button>
				<Button href={ '/domains-prototype/manage/start/hosts/store/' + domain }>An online store</Button>
				<Button href={ '/domains-prototype/manage/start/hosts/profile/' + domain }>Profile site</Button>
				<Button href={ '/domains-prototype/manage/start/hosts/brochure/' + domain }>Brochure site</Button>
				<Button href={ '/domains-prototype/manage/start/hosts/website/' + domain }>A website</Button>
				<Button href={ '/domains-prototype/manage/start/hosts/' + domain }>Something else</Button>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const hosts = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>Select a host</h2>
			<Card>
				<Button href={ '/domains-prototype/manage/start/connecting/' + domain }>WordPress.com</Button>
				<Button href={ '/domains-prototype/manage/start/connecting/' + domain }>Tumblr</Button>
				<Button href={ '/domains-prototype/manage/start/connecting/' + domain }>Squarespace</Button>
			</Card>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const connecting = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>Connecting { domain }</h2>
			<Button href={ '/domains-prototype/manage/' + domain }>Finish</Button>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const connect = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>{ domain } Connect to existing site</h2>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const email = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>{ domain } Add email</h2>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const settings = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>{ domain } Settings</h2>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/domains-prototype', search );
	page( '/domains-prototype/select/:domainName?', select );
	page( '/domains-prototype/checkout/:domainName?', checkout );
	page( '/domains-prototype/success/:domainName?', success );

	page( '/domains-prototype/manage/:domainName?', siteSelection, navigation, manage );
	page( '/domains-prototype/manage/landing-page/:domainName?', siteSelection, navigation, landingPage );
	page( '/domains-prototype/manage/start/:domainName?', siteSelection, navigation, start );
	page( '/domains-prototype/manage/start/hosts/:type?/:domainName?', siteSelection, navigation, hosts );
	page( '/domains-prototype/manage/start/connecting/:domainName?', siteSelection, navigation, connecting );
	page( '/domains-prototype/manage/connect/:domainName?', siteSelection, navigation, connect );
	page( '/domains-prototype/manage/email/:domainName?', siteSelection, navigation, email );
	page( '/domains-prototype/manage/settings/:domainName?', siteSelection, navigation, settings );
}
