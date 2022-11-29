import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderSidebarOrganizationsList from './list';

export class ReaderSidebarOrganizations extends Component {
	static propTypes = {
		organizations: PropTypes.array.isRequired,
		path: PropTypes.string.isRequired,
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
		const { path, translate } = this.props;
		const organization = this.fetchOrganization();
		// Note: No need to translate 'a8c', but 'p2' is a brand so it should be translated
		const organizationSlug = organization.slug === 'a8c' ? 'a8c' : translate( 'p2' );

		return (
			<>
				<h2>
					{ translate( 'Following' ) } ({ organizationSlug }){ ' ' }
					<a href="/following/mark-all">{ translate( 'Mark all as seen' ) }</a>
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

export default localize( ReaderSidebarOrganizations );
