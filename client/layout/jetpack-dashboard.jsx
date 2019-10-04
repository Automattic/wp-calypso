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
import AsyncLoad from 'components/async-load';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackDashboardLayout extends Component {
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

				<div id="content" className="layout__content">
					<GlobalNotices id="notices" notices={ notices.list } />
					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
				{ 'development' === process.env.NODE_ENV && (
					<AsyncLoad require="components/webpack-build-monitor" placeholder={ null } />
				) }
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
} )( JetpackDashboardLayout );
