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

export default localize(class extends React.Component {
    static displayName = 'CustomizerLoadingPanel';

	static propTypes = {
		isLoaded: PropTypes.bool,
	};

	static defaultProps = {
		isLoaded: false,
	};

	render() {
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
});
