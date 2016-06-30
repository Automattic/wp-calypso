import React, { PropTypes } from 'react';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

const RecommendedNavigation = React.createClass( {
	propTypes: { selected: PropTypes.oneOf( [ 'for-you', 'sites', 'tags' ] ).isRequired },

	render() {
		const current = this.props.selected;
		const sectionNames = {
			'for-you': this.translate( 'Recommendations: For You' ),
			posts: this.translate( 'Recommendations: Posts' ),
			sites: this.translate( 'Recommendations: Sites' ),
			tags: this.translate( 'Recommendations: Tags' )
		};

		return (
			<SectionNav selectedText={ sectionNames[ current ] }>
				<NavTabs>
					<NavItem path="/recommendations/mine" selected={ current === 'for-you' }>{ this.translate( 'For You' ) }</NavItem>
					<NavItem path="/recommendations/posts" selected={ current === 'posts' }>{ this.translate( 'Posts' ) }</NavItem>
					<NavItem path="/recommendations" selected={ current === 'sites' }>{ this.translate( 'Topics' ) }</NavItem>
					<NavItem path="/tags" selected={ current === 'tags' }>{ this.translate( 'Tags' ) }</NavItem>
				</NavTabs>
			</SectionNav>
			);
	}
} );

export default RecommendedNavigation;
