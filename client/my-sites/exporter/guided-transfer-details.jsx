/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import GridiconList from 'components/gridicon-list';
import GridiconListItem from 'components/gridicon-list/item';

const GuidedTransferDetails = ( { translate } ) => {
	const Item = ( { children } ) =>
		<GridiconListItem className="exporter__guided-transfer-feature-list-item" icon="checkmark">
			<span className="exporter__guided-transfer-feature-text">
				{ children }
			</span>
		</GridiconListItem>;

	return <CompactCard className="exporter__guided-transfer-details">
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
			<GridiconList className="exporter__guided-transfer-feature-list">
				<Item>{ translate( 'Seamless content transfer' ) }</Item>
				<Item>{ translate( 'Install and configure plugins to keep your functionality' ) }</Item>
				<Item>
					{ translate( 'Switch your domain over {{link}}and more!{{/link}}', {
						components: {
							link: <a href="#" />
						}
					} ) }
				</Item>
			</GridiconList>
		</div>
	</CompactCard>;
};

export default localize( GuidedTransferDetails );

