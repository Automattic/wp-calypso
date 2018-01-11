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

class ManageExternalView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			URL: PropTypes.string.isRequired,
		} ),
	};

	render = () => {
		const { site, translate } = this.props;

		const title = translate( 'Manage your store' );
		const line = translate(
			'Stores in your country are managed directly on your site. ' +
				'We will let you know when you can manage your store here.'
		);
		const actionURL = site.URL + '/wp-admin/edit.php?post_type=shop_order';
		return (
			<div className="dashboard__manage-externally">
				<EmptyContent
					title={ title }
					line={ line }
					action={ translate( 'OK, take me to my site' ) }
					actionURL={ actionURL }
				/>
			</div>
		);
	};
}

export default localize( ManageExternalView );
