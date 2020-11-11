/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import ExternalLink from 'calypso/components/external-link';
import { recordTrack } from 'woocommerce/lib/analytics';

class ManageExternalView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			URL: PropTypes.string.isRequired,
		} ),
	};

	recordAction = () => {
		recordTrack( 'calypso_woocommerce_manage_external_clicked' );
	};

	render = () => {
		const { site, translate } = this.props;

		const title = translate( 'Managing your store' );
		const line = translate(
			'Howdy! It looks like your store is located in a country that we can not fully ' +
				'support in this interface. Store setup and management will take place in wp-admin, ' +
				'our classic admin interface. We are actively working on adding broader support and ' +
				"we'll let you know when you can manage your store here!"
		);

		const actionURL = site.URL + '/wp-admin/edit.php?post_type=shop_order';
		const action = (
			<ExternalLink
				icon
				className="dashboard__empty-action button is-primary"
				onClick={ this.recordAction }
				href={ actionURL }
			>
				{ translate( 'Manage my Store' ) }
			</ExternalLink>
		);
		const secondaryAction = null;

		return (
			<div className="dashboard__manage-externally">
				<EmptyContent
					title={ title }
					line={ line }
					action={ action }
					secondaryAction={ secondaryAction }
				/>
			</div>
		);
	};
}

export default localize( ManageExternalView );
