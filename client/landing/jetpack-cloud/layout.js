/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import JetpackCloudMasterbar from './components/masterbar';
import EmptyContent from 'components/empty-content';

class JetpackCloudLayout extends Component {
	static propTypes = {
		primary: PropTypes.element,
		secondary: PropTypes.element,
	};

	render() {
		return (
			<div className="layout is-section-jetpack-cloud">
				<JetpackCloudMasterbar />

				<div id="content" className="layout__content">
					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary || <EmptyContent /> }
					</div>
				</div>
			</div>
		);
	}
}

export default JetpackCloudLayout;
