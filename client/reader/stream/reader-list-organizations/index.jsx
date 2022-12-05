import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderListOrganizationsList from './list';

export class ReaderListOrganizations extends Component {
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

	fetchOrganizationSlug( slug ) {
		const { translate } = this.props;
		let organizationSlug = '';
		// Return empty if slug value is missing
		if ( ! slug ) {
			return organizationSlug;
		}
		// Note: No need to translate 'a8c', but 'p2' is a brand so it should be translated
		// Everything else should remain untranslated, since it will be dynamic based on the org name
		if ( slug === 'p2' ) {
			organizationSlug = translate( 'p2' );
		} else {
			organizationSlug = slug;
		}
		return organizationSlug;
	}

	renderItems() {
		const { path, translate } = this.props;
		const organization = this.fetchOrganization();

		return (
			<>
				<h2>
					{ translate( 'Following %s', { args: this.fetchOrganizationSlug( organization.slug ) } ) }
				</h2>
				<ReaderListOrganizationsList
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

export default localize( ReaderListOrganizations );
