import React from 'react';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

const ListManagementNavigation = React.createClass( {
	propTypes: {
		selected: React.PropTypes.oneOf( [ 'sites', 'tags', 'description-edit', 'followers' ] ).isRequired,
		list: React.PropTypes.shape( {
			owner: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} )
	},

	render() {
		if ( ! this.props.list ) {
			return null;
		}

		const current = this.props.selected;
		const sectionNames = {
			sites: this.translate( 'Sites' ),
			tags: this.translate( 'Tags' ),
			'description-edit': this.translate( 'List Description' )
		};
		const baseListUrl = `/read/list/${this.props.list.owner}/${this.props.list.slug}`;

		return (
			<SectionNav selectedText={ sectionNames[ current ] }>
				<NavTabs>
					<NavItem path={ `${ baseListUrl }/edit` } selected={ current === 'description-edit' }>{ this.translate( 'Description' ) }</NavItem>
					<NavItem path={ `${ baseListUrl }/sites` } selected={ current === 'sites' }>{ this.translate( 'Sites' ) }</NavItem>
					<NavItem path={ `${ baseListUrl }/tags` } selected={ current === 'tags' }>{ this.translate( 'Tags' ) }</NavItem>
				</NavTabs>
			</SectionNav>
			);
	}
} );

export default ListManagementNavigation;
