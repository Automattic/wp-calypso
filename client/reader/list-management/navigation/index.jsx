import React from 'react';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

const ListManagementNavigation = React.createClass( {
	propTypes: {
		selected: React.PropTypes.oneOf( [ 'contents', 'description-edit', 'followers' ] ).isRequired,
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	render() {
		const current = this.props.selected;
		const sectionNames = {
			contents: this.translate( 'List Contents' ),
			'description-edit': this.translate( 'List Description' ),
			followers: this.translate( 'List Followers' )
		};
		const baseListUrl = `/read/list/${this.props.list.owner}/${this.props.list.slug}`;

		return (
			<SectionNav selectedText={ sectionNames[ current ] }>
				<NavTabs>
					<NavItem path={ `${baseListUrl}/edit` } selected={current === 'contents'}>{ this.translate( 'Contents' )}</NavItem>
					<NavItem path={ `${baseListUrl}/description/edit` } selected={current === 'description-edit'}>{ this.translate( 'Description' )}</NavItem>
					<NavItem path={ `${baseListUrl}/followers` } selected={current === 'followers'}>{ this.translate( 'Followers' )}</NavItem>
				</NavTabs>
			</SectionNav>
			);
	}
} );

export default ListManagementNavigation;
