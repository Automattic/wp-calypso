/**
 * External dependencies
 */
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ReaderSidebarOrganizationsList from './list';

export class ReaderSidebarOrganizations extends Component {
	static propTypes = {
		organizations: PropTypes.array.isRequired,
		path: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	renderItems() {
		const { organizations, path } = this.props;
		return map( organizations, ( organization ) => (
			<ReaderSidebarOrganizationsList
				key={ organization.id }
				path={ path }
				organization={ organization }
			/>
		) );
	}

	render() {
		const { organizations } = this.props;

		if ( ! organizations ) {
			return null;
		}

		return this.renderItems();
	}
}

export default ReaderSidebarOrganizations;
