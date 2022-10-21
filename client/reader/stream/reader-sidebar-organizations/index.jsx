import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderSidebarOrganizationsList from './list';

export class ReaderSidebarOrganizations extends Component {
	static propTypes = {
		organizations: PropTypes.array.isRequired,
		path: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	fetchOrganization() {
		const { organizations, path } = this.props;
		const slug = path.split( '/' )[ 2 ];
		let organization = organizations[ 0 ];

		for ( let i = 0; i < organizations.length; i++ ) {
			if ( organizations[ i ].slug === slug ) {
				organization = organizations[ i ];
				break;
			}
		}

		return organization;
	}

	renderItems() {
		const { path } = this.props;
		const organization = this.fetchOrganization();
		return (
			<>
				<h2>
					Following ({ organization.slug }) <a href="/following/mark-all">Mark all as seen</a>
				</h2>
				<ReaderSidebarOrganizationsList
					key={ organization.id }
					path={ path }
					organization={ organization }
				/>
			</>
		);
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
