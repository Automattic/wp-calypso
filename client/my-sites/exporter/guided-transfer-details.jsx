/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';

const GuidedTransferDetails = ( { translate } ) => {
	const Item = ( { children } ) =>
		<li className="exporter__guided-transfer-feature-list-item">
			<Gridicon className="exporter__guided-transfer-feature-icon" size={ 18 } icon="checkmark" />
			<span className="exporter__guided-transfer-feature-text">
				{ children }
			</span>
		</li>;

	return <CompactCard className="exporter__guided-transfer-details">
		<div className="exporter__guided-transfer-details-container">
			<div className="exporter__guided-transfer-details-text">
				<h1 className="exporter__guided-transfer-details-title">
					{ translate( 'Hassle-free migration with two weeks of support' ) }
				</h1>
				{ translate(
					'Have one of our Happiness Engineers {{strong}}transfer your ' +
					'site{{/strong}} to a self-hosted WordPress.org installation with ' +
					'one of our hosting partners.', { components: { strong: <strong /> } }
				) }
				<br/>
				<a href="https://en.support.wordpress.com/guided-transfer/" >
					{ translate( 'Learn more.' ) }
				</a>
			</div>
			<ul className="exporter__guided-transfer-feature-list">
				<Item>{ translate( 'Seamless content transfer' ) }</Item>
				<Item>{ translate( 'Install and configure plugins to keep your functionality' ) }</Item>
				<Item>
					{ translate( 'Switch your domain over {{link}}and more!{{/link}}', {
						components: {
							link: <a href="https://en.support.wordpress.com/guided-transfer/" />
						}
					} ) }
				</Item>
			</ul>
		</div>
	</CompactCard>;
};

export default localize( GuidedTransferDetails );

