/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { get, identity, includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ImporterLogo from 'my-sites/importer/importer-logo';
import StartButton from 'my-sites/importer/importer-header/start-button';
import { getSelectedSite } from 'state/ui/selectors';

class ImporterListItem extends React.PureComponent {
	static displayName = 'ImporterListItem';

	static propTypes = {
		title: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		icon: PropTypes.string,
		description: PropTypes.string,
		site: PropTypes.object,
	};

	static defaultProps = {
		translate: identity,
		importers: [],
	}

	render() {
		const { description, icon, site, title, type } = this.props;

		console.log( this.props );

		return (
			<header className="importer-header">
				<ImporterLogo icon={ icon } />
				<StartButton importType={ type } site={ site } />
				<div className="importer-header__service-info">
					<h1 className="importer-header__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
}

export default connect(
 	state => ( {
		site: getSelectedSite( state ),
	} )
)( ImporterListItem );
