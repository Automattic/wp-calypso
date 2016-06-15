/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

const GuidedTransferDetails = ( { translate } ) =>
	<CompactCard className="exporter__guided-transfer-details">
		<div className="exporter__guided-transfer-details-container">
			<div className="exporter__guided-transfer-details-text">
				<h1 className="exporter__guided-transfer-details-title">
					{ translate( 'Hassle-free migration with two weeks of support' ) }
				</h1>
				{ translate(
`Have one of our Happiness Engineers {{strong}}transfer your
site{{/strong}} to a self-hosted WordPress.org installation with
one of our hosting partners.`, { components: { strong: <strong /> } }
				) }
				<br/>
				<a href="#" >{ translate( 'Learn more.' ) }</a>
			</div>
			<ul className="exporter__guided-transfer-feature-list">
			<li>{ translate( 'Seamless content transfer' ) }</li>
			<li>{ translate( 'Install and configure plugins to keep your functionality' ) }</li>
			<li>{ translate( 'Switch your domain over {{link}}and more!{{/link}}', {
				components: {
					link: <a href="#" />
				}
			} ) }</li>
			</ul>
		</div>
	</CompactCard>;

export default localize( GuidedTransferDetails );

