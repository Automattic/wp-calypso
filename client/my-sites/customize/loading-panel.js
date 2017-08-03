/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'CustomizerLoadingPanel',

	propTypes: {
		isLoaded: React.PropTypes.bool,
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
					{ this.translate( 'Loading the Customizer…' ) }
				</div>
			</div>
		);
	}
} );
