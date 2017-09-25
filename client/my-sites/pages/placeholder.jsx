/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import CompactCard from 'components/card/compact';

export default {
	Page: localize( React.createClass( {
		displayName: 'PagePlaceholder',

		render: function() {
			return (
			    <CompactCard className="page is-placeholder">
					{ this.props.multisite ? <SiteIcon size={ 34 } /> : null }
					<a className="page__title"><span className="placeholder-text">{ this.props.translate( 'Loading a page of Pages…' ) }</span></a>
					{ this.props.multisite ? <span className="page__site-url "><span className="placeholder-text">{ this.props.translate( 'A domain, quite soon…' ) }</span></span> : null }
				</CompactCard>
			);
		}
	} ) ),
	Marker: React.createClass( {
		displayName: 'MarkerPlaceholder',

		render: function() {
			return (
				<div className="pages__page-list-header is-placeholder">
					<span>&nbsp;</span>
				</div>
			);
		}
	} )
};
