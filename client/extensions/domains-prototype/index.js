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
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import Manage from './manage';
import { navigation, siteSelection } from 'my-sites/controller';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import RegisterDomainStep from 'components/domains/register-domain-step';
import route from 'lib/route';
import { setSection } from 'state/ui/actions';
import styles from './styles';
import Stylizer, { insertCss } from './stylizer';

/**
 * Module variables
 */
const productsList = productsFactory();

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

const back = () => {
	window.history.back();
};

const header = ( text ) => {
	return ( <HeaderCake onClick={ back }>{ text }</HeaderCake> );
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

const getManageScreen = ( domain ) => {
	if ( ! domain ) {
		return (
			<Main>
				{ 'Select a domain' }
			</Main>
		);
	}

	return (
		<Main>
			<Manage domain={ domain } />
		</Main>
	);
};

const manage = ( context ) => {
	const domain = context.params.domainName;
	render( getManageScreen( domain ), context );
};

const domains = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( (
		<Main>
			<h1 className={ styles.header }>Create a website</h1>
			<div>Choosing an address is the best way to get started with your very own site</div>
			<Button href="/start/domain-first">Get started</Button>
		</Main> ),
		context
	);
};

export default function() {
	page( '/domains-prototype', domains );
	page( '/domains-prototype/search', search );

	page( '/domains-prototype/manage/:domainName?', siteSelection, navigation, manage );
}
