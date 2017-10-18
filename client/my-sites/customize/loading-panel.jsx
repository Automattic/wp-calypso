/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const CustomizerLoadingPanel = React.createClass( {
	displayName: 'CustomizerLoadingPanel',

	propTypes: {
		isLoaded: PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			isLoaded: false,
		};
	},

	render: function() {
		const noticeClassNames = classnames( 'customizer-loading-panel__notice', {
			'is-iframe-loaded': this.props.isLoaded,
		} );

		return (
			<div className={ noticeClassNames }>
				<div className="customizer-loading-panel__notice-label">
					<Spinner />
					{ this.props.translate( 'Loading the Customizer…' ) }
				</div>
			</div>
		);
	},
} );

export default localize(CustomizerLoadingPanel);
