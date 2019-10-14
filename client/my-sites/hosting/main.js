/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Button from 'components/button';
import MaterialIcon from 'components/material-icon';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Spinner from 'components/spinner';
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
	const [ loadingPMA, setLoadingPMA ] = useState( false );
	const dummyInfo = {
		[ translate( 'URL' ) ]: 'sftp1.wordpress.com',
		[ translate( 'Port' ) ]: 22,
		[ translate( 'Username' ) ]: 'test',
		[ translate( 'Password' ) ]: 'test',
	};

	function handlePMALogin() {
		setLoadingPMA( true );
		// If we don't want the pma url to pass through the redux store we can just do a raw wpcom.req here
		// TODO: If we proceed with this it needs to be a POST, but setting apiNamespace is not currently working for POST
		wpcom.req
			.get( `/sites/${ siteId }/hosting/pma`, {
				apiNamespace: 'wpcom/v2',
			} )
			.then( response => {
				if ( response && response.pmaUrl ) {
					window.open( response.pmaUrl );
				}
			} ); // TODO: Add error handling

		setLoadingPMA( false );
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
						<Button onClick={ handlePMALogin } className="hosting__card-phpmyadmin-login">
							{ loadingPMA && <Spinner /> }
							{ ! loadingPMA && translate( 'Access PhpMyAdmin' ) }
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
