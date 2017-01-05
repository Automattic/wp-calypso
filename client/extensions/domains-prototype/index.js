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
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import Main from 'components/main';
import Manage from './manage';
import { navigation, siteSelection } from 'my-sites/controller';
import Plans from 'my-sites/plans/main';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import RegisterDomainStep from 'components/domains/register-domain-step';
import route from 'lib/route';
import SectionHeader from 'components/section-header';
import { setSection } from 'state/ui/actions';
import sitesFactory from 'lib/sites-list';
import SitePicker from 'components/site-selector';
import styles from './styles';
import Stylizer, { insertCss } from './stylizer';

/**
 * Module variables
 */
const productsList = productsFactory();
const sites = sitesFactory();

const render = ( content, context ) => {
	renderWithReduxStore( (
		<Stylizer onInsertCss={ insertCss }>
			{ content }
		</Stylizer>
	), document.getElementById( 'primary' ), context.store );
};

const onAddDomain = ( suggestion ) => {
	page( '/domains-prototype/select/' + suggestion.domain_name );
};

const header = ( text ) => {
	return ( <SectionHeader label={ text }>🐬</SectionHeader> );
};

const search = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( ( <Main>
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
		</Main> ), context
	);
};

const select = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( (
		<Main>
			{ header( 'You have selected ' + context.params.domainName ) }
			<Card>
				You selected { context.params.domainName }.
				This screen is redundant
			</Card>
			<Button primary href={ '/domains-prototype/checkout/' + context.params.domainName }>Buy now</Button>
		</Main>
	), context );
};

const success = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( (
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

	render(
		(
			<CheckoutData>
				<Checkout
					product={ context.params.product }
					productsList={ productsList }
					selectedFeature={ context.params.feature }
				/>
			</CheckoutData>
		),
		context
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
		<Manage domain={ domain } />
	);
};

const manage = ( context ) => {
	const domain = context.params.domainName;
	render( getManageScreen( domain ), context );
};

const landingPage = ( context ) => {
	const domain = context.params.domainName;
	render( (
		<Main>
			<h2 className={ styles.header }>Set up a landing page for { domain }</h2>
			<p>I think we can probably just show the customizer here</p>
			<Button href={ '/domains-prototype/manage/' + domain }>Finish</Button>
		</Main>
	), context );
};

const start = ( context ) => {
	const domain = context.params.domainName;
	render( (
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
	), context );
};

const hosts = ( context ) => {
	const domain = context.params.domainName;
	render( (
		<Main>
			<h2>Select a host</h2>
			<Card>
				<Button href={ '/domains-prototype/manage/start/plans/' + domain }>WordPress.com</Button>
				<Button href={ '/domains-prototype/manage/start/connecting/' + domain }>Tumblr</Button>
				<Button href={ '/domains-prototype/manage/start/connecting/' + domain }>Squarespace</Button>
			</Card>
		</Main>
	), context );
};

const plans = ( context ) => {
	render( (
		<Main>
			<h2>Select a plan</h2>
			
			<CheckoutData>
				<Plans
					context={ context }
					intervalType={ context.params.intervalType }
					destinationType={ context.params.destinationType }
					selectedFeature={ context.query.feature }
				/>
			</CheckoutData>,
		</Main>
	), context );
};

const connecting = ( context ) => {
	const domain = context.params.domainName;
	render( (
		<Main>
			<h2>Connecting { domain }</h2>
			<Button href={ '/domains-prototype/manage/' + domain }>Finish</Button>
		</Main>
	), context );
};

const connectSubmit = ( event, domain ) => {
	event.preventDefault();
	page( '/domains-prototype/manage/connect-existing/' + domain );
};

const preventPickerDefault = ( event ) => {
	event.preventDefault();
	event.stopPropagation();
};

const connect = ( context ) => {
	const domain = context.params.domainName,
		siteFragment = route.getSiteFragment( context.pathname );
	let basePath = context.pathname;

	if ( siteFragment ) {
		basePath = route.sectionify( context.pathname );
	}

	render( (
		<Main>
			<h2>Connect { domain } to an existing site</h2>
			<form onSubmit={ ( event ) => connectSubmit( event, domain ) }>
				<label>Enter the address of the site to connect { domain } to</label>
				<FormTextInputWithAffixes type="text" placeholder="example.com" prefix="http://" />
			</form>
			<p>or select a site from the list</p>
			<SitePicker
				sites={ sites }
				allSitesPath={ basePath }
				siteBasePath={ basePath }
				onClose={ preventPickerDefault }
			/>
		</Main>
	), context );
};

const connectExisting = ( context ) => {
	const domain = context.params.domainName;
	render( (
		<Main>
			<h2>Connecting { domain } to an http://sitename.com</h2>
			<p>Some stuff</p>
			<Button href={ '/domains-prototype/manage/' + domain }>Finish</Button>
		</Main>
	), context );
};

const domains = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( (
		<Main>
			<h1>Create a website</h1>
			<div>Choosing an address is the best way to get started with your very own site</div>
			<Button href="/start/domain-first">Get started</Button>
		</Main> ),
		context
	);
};

export default function() {
	page( '/domains-prototype', domains );
	page( '/domains-prototype/search', search );
	page( '/domains-prototype/select/:domainName?', select );
	page( '/domains-prototype/checkout/:domainName?', checkout );
	page( '/domains-prototype/success/:domainName?', success );

	page( '/domains-prototype/manage/:domainName?', siteSelection, navigation, manage );
	page( '/domains-prototype/manage/landing-page/:domainName?', siteSelection, navigation, landingPage );
	page( '/domains-prototype/manage/start/:domainName?', siteSelection, navigation, start );
	page( '/domains-prototype/manage/start/hosts/:type?/:domainName?', siteSelection, navigation, hosts );
	page( '/domains-prototype/manage/start/plans/:type?/:domainName?', siteSelection, navigation, plans );
	page( '/domains-prototype/manage/start/connecting/:domainName?', siteSelection, navigation, connecting );
	page( '/domains-prototype/manage/connect/:domainName?', siteSelection, navigation, connect );
	page( '/domains-prototype/manage/connect-existing/:domainName?', siteSelection, navigation, connectExisting );
}
