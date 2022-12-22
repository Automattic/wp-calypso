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
		const organizationSlug = path.split( '/' ).pop();
		return organizations.find( ( organization ) => organization.slug === organizationSlug );
	}

	renderItems() {
		const { path, translate } = this.props;
		const organization = this.fetchOrganization();

		if ( ! organization ) {
			return null;
		}

		return (
			<>
				<h2>{ translate( 'Following' ) }</h2>
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
