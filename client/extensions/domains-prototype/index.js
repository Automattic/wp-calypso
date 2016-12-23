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
import { navigation, siteSelection } from 'my-sites/controller';
import PlanCompareCard from 'my-sites/plan-compare-card';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import RegisterDomainStep from 'components/domains/register-domain-step';
import route from 'lib/route';
import SectionHeader from 'components/section-header';
import { setSection } from 'state/ui/actions';
import sitesFactory from 'lib/sites-list';
import SitePicker from 'components/site-selector';
import styles from './styles';

/**
 * Module variables
 */
const productsList = productsFactory();
const sites = sitesFactory();

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
		<Main wideLayout>
			<h2 style={ styles.header }>What do you want to use { domain } for?</h2>
			<div style={ styles.manageContainer }>
				<PlanCompareCard
					title="Landing Page"
					line="Customize a simple, one-page placeholder."
					buttonName="Create a landing page"
					currentPlan={ false }/>

				<PlanCompareCard
					title="New Site"
					line="Build a new website or blog."
					buttonName="Create a new site"
					currentPlan={ false }/>

				<PlanCompareCard
					title="Existing Site"
					line="Connect an existing website or redirect to your social media."
					buttonName="Connect a site"
					currentPlan={ false }/>

				<PlanCompareCard
					title="Add Email"
					line="Add professional email to your domain."
					buttonName="Set up email"
					currentPlan={ false }/>
			</div>
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
			<h2>Set up a landing page for { domain }</h2>
			<p>I think we can probably just show the customizer here</p>
			<Button href={ '/domains-prototype/manage/' + domain }>Finish</Button>
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

	renderWithReduxStore( (
		<Main>
			<h2>Connect { domain } to an existing site</h2>
			<form onSubmit={ ( event ) => connectSubmit( event, domain ) }>
				<label>Enter the address of the site to connect { domain } to</label>
				<FormTextInputWithAffixes type="text" placeholder="example.com" prefix="http://" />
				<p>or select a site from the list</p>
				<SitePicker
					sites={ sites }
					allSitesPath={ basePath }
					siteBasePath={ basePath }
					onClose={ preventPickerDefault }
				/>
			</form>
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

const connectExisting = ( context ) => {
	const domain = context.params.domainName;
	renderWithReduxStore( (
		<Main>
			<h2>Connecting { domain } to an http://sitename.com</h2>
			<p>Some stuff</p>
			<Button href={ '/domains-prototype/manage/' + domain }>Finish</Button>
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
	page( '/domains-prototype/manage/connect-existing/:domainName?', siteSelection, navigation, connectExisting );
}
