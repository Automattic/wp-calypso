// External dependencies
import React from 'react';
import debugModule from 'debug';
import { connect } from 'react-redux';

// Internal dependencies
import ListManagementDescriptionEdit from './description-edit';
import ListManagementTags from './tags';
import ListManagementSites from './sites';
import Main from 'components/main';
import Navigation from 'reader/list-management/navigation';
import { getListByOwnerAndSlug } from 'state/reader/lists/selectors';
import QueryReaderList from 'components/data/query-reader-list';

const debug = debugModule( 'calypso:reader:list-management' ); //eslint-disable-line no-unused-vars

const ListManagement = React.createClass( {
	propTypes: {
		owner: React.PropTypes.string.isRequired,
		slug: React.PropTypes.string.isRequired,
		tab: React.PropTypes.oneOf( [ 'sites', 'tags', 'description-edit' ] ).isRequired,
	},

	renderTabContent() {
		switch ( this.props.tab ) {
			case 'description-edit':
				return <ListManagementDescriptionEdit list={ this.props.list } />;
			case 'tags':
				return <ListManagementTags list={ this.props.list } />;
			case 'sites':
				return <ListManagementSites list={ this.props.list } />;
		}
	},

	render() {
		return (
			<Main className={ 'list-management-' + this.props.tab }>
				<QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />
				<Navigation selected={ this.props.tab } list={ this.props.list } />
				{ this.renderTabContent() }
			</Main>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		const { owner, slug } = ownProps;
		return {
			list: getListByOwnerAndSlug( state, owner, slug )
		};
	}
)( ListManagement );
