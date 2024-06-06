/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Spinner } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

class CustomizerLoadingPanel extends Component {
	static displayName = 'CustomizerLoadingPanel';

	static propTypes = {
		isLoaded: PropTypes.bool,
	};

	static defaultProps = {
		isLoaded: false,
	};

	render() {
		const noticeClassNames = clsx( 'customizer-loading-panel__notice', {
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
	}
}

export default localize( CustomizerLoadingPanel );
