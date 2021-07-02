/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { getSiteSlug } from 'calypso/state/sites/selectors';

class JetpackManageErrorPage extends PureComponent {
	getSettings() {
		const { siteSlug, template, translate } = this.props;
		const defaults = {
			noDomainsOnJetpack: {
				title: translate( 'Domains are not available for this site.' ),
				line: translate(
					'You can only purchase domains for sites hosted on WordPress.com at this time.'
				),
				action: translate( 'View Plans' ),
				actionURL: '/plans/' + ( siteSlug || '' ),
			},
			default: {},
		};
		return Object.assign( {}, defaults[ template ] || defaults.default, this.props );
	}

	render() {
		const settings = this.getSettings();

		return (
			<div>
				<EmptyContent { ...settings } />
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
} ) )( localize( JetpackManageErrorPage ) );
