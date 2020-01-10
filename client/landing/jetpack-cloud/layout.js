/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import MasterbarLoggedIn from './masterbar';
import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';

class JetpackCloudLayout extends Component {
	static propTypes = {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		// connected props
		sectionName: PropTypes.string,
	};

	render() {
		const sectionClass = classnames( 'layout', `is-section-${ this.props.sectionName }` );

		return (
			<div className={ sectionClass }>
				<DocumentHead />

				<MasterbarLoggedIn />

				<div id="content" className="layout__content">
					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
			</div>
		);
	}
}

export default connect( state => {
	const sectionName = getSectionName( state );
	const siteId = getSelectedSiteId( state );

	return {
		sectionName,
		siteId,
	};
} )( JetpackCloudLayout );
