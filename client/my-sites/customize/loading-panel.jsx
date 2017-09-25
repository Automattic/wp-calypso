/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

export default localize( React.createClass( {
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
			'is-iframe-loaded': this.props.isLoaded
		} );

		return (
		    <div className={ noticeClassNames }>
				<div className="customizer-loading-panel__notice-label">
					<Spinner />
					{ this.props.translate( 'Loading the Customizer…' ) }
				</div>
			</div>
		);
	}
} ) );
