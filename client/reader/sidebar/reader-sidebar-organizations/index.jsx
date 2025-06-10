import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
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
			<li key={ organization.id }>
				<ReaderSidebarOrganizationsList
					key={ organization.id }
					path={ path }
					organization={ organization }
				/>
			</li>
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
