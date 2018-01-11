/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
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

		const title = translate( 'Manage your store' );
		const line = translate(
			'Stores in your country are managed directly on your site. ' +
				'We will let you know when you can manage your store here.'
		);

		const actionURL = site.URL + '/wp-admin/edit.php?post_type=shop_order';
		const action = (
				<a
					className="dashboard__empty-action button is-primary"
					onClick={ this.recordAction }
					href={ actionURL }
				>
					{ translate( 'OK, take me to my site' ) }
				</a>
			),
			secondaryAction = null;

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
