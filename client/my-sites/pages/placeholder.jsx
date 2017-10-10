/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SiteIcon from 'blocks/site-icon';

module.exports = {
	Page: localize(React.createClass( {
		displayName: 'PagePlaceholder',

		render: function() {
			return (
                <CompactCard className="page is-placeholder">
					{ this.props.multisite ? <SiteIcon size={ 34 } /> : null }
					<a className="page__title">
						<span className="placeholder-text">
							{ this.props.translate( 'Loading a page of Pages…' ) }
						</span>
					</a>
					{ this.props.multisite ? (
						<span className="page__site-url ">
							<span className="placeholder-text">
								{ this.props.translate( 'A domain, quite soon…' ) }
							</span>
						</span>
					) : null }
				</CompactCard>
            );
		},
	} )),
	Marker: localize(React.createClass( {
		displayName: 'MarkerPlaceholder',

		render: function() {
			return (
				<div className="pages__page-list-header is-placeholder">
					<span>&nbsp;</span>
				</div>
			);
		},
	} )),
};
