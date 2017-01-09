/**
 * External dependencies
 */
import noop from 'lodash/noop';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
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

const success = ( context ) => {
	context.store.dispatch( setSection( null, { hasSidebar: false } ) );

	render( (
		<Main>
			<h1 className={ styles.header }>Site is setup</h1>
			<div>You have created a site. blah blah blah.</div>
		</Main> ),
		context
	);
};

export default function() {
	page( '/domains-prototype/search', search );
	page( '/domains-prototype/success', success );
}
