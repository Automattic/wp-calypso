/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * WordPress dependencies
 */

import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import Spinner from 'components/spinner';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Button from 'components/button';
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

const DataSection = ( { title, data } ) => {
	return (
		<tr>
			<th>{ title }:</th>
			<td>{ data }</td>
		</tr>
	);
};

const Hosting = ( { translate, siteId } ) => {
	const [ loadingToken, setLoadingToken ] = useState( false );

	const dummyInfo = {
		[ translate( 'URL' ) ]: 'sftp1.wordpress.com',
		[ translate( 'Port' ) ]: 22,
		[ translate( 'Username' ) ]: 'test',
		[ translate( 'Password' ) ]: 'test',
	};
	function handleClick() {
		setLoadingToken( true );
		// We don't want the token to pass through the redux store, so just doing a raw wpcom.req here
		// TODO: This needs to be a POST, but setting apiNamespace is not currently working for POST
		wpcom.req
			.get( `/sites/${ siteId }/hosting/pam/token`, {
				apiNamespace: 'wpcom/v2',
			} )
			.then( response => {
				if ( response.token ) {
					window.open( `https://speciallink/pma.php?token=${ response.token }`, '_blank' );
				}
			} )
			.catch( () => {
				// TODO: Add proper error handling
				// console.log( error );
			} );

		setLoadingToken( false );
	}

	return (
		<Main className="hosting is-wide-layout">
			<PageViewTracker path="hosting/:site" title="Hosting" />
			<DocumentHead title={ translate( 'Hosting' ) } />
			<SidebarNavigation />
			<div className="hosting__cards">
				<Card>
					<div className="hosting__card-icon-col">
						<MaterialIcon className="hosting__card-icon" icon="cloud" size={ 32 } />
					</div>
					<div className="hosting__card-col">
						<CardHeading>{ translate( 'SFTP Information' ) }</CardHeading>
						<p>
							{ translate( "Access and edit your website's files directly using an FTP client." ) }
						</p>
						<table className="hosting__info-table">
							<tbody>
								{ map( dummyInfo, ( data, title ) => (
									<DataSection key={ title } { ...{ data, title } } />
								) ) }
							</tbody>
						</table>
					</div>
				</Card>
				<Card>
					<div className="hosting__card-icon-col">
						<MaterialIcon className="hosting__card-icon" icon="dns" size={ 32 } />
					</div>
					<div className="hosting__card-col">
						<CardHeading>{ translate( 'Database Access' ) }</CardHeading>
						<p>
							{ translate(
								'Manage your databases with PHPMyAdmin and run a wide range of operations with MySQL.'
							) }
						</p>
						<Button onClick={ handleClick } className="hosting__card-phpmyadmin-login">
							{ loadingToken && <Spinner /> }
							{ ! loadingToken && translate( 'Login to PhpMyAdmin' ) }
						</Button>
					</div>
				</Card>
			</div>
		</Main>
	);
};

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( Hosting ) );
