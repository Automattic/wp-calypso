/** @format */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

class RecommendedNavigation extends React.Component {
	static propTypes = { selected: PropTypes.oneOf( [ 'for-you', 'sites', 'tags' ] ).isRequired };

	render() {
		const current = this.props.selected;
		const sectionNames = {
			'for-you': this.props.translate( 'Recommendations: For You' ),
			posts: this.props.translate( 'Recommendations: Posts' ),
			sites: this.props.translate( 'Recommendations: Sites' ),
			tags: this.props.translate( 'Recommendations: Tags' ),
		};

		return (
			<SectionNav selectedText={ sectionNames[ current ] }>
				<NavTabs>
					<NavItem path="/recommendations/mine" selected={ current === 'for-you' }>
						{ this.props.translate( 'For You' ) }
					</NavItem>
					<NavItem path="/recommendations/posts" selected={ current === 'posts' }>
						{ this.props.translate( 'Posts' ) }
					</NavItem>
					<NavItem path="/recommendations" selected={ current === 'sites' }>
						{ this.props.translate( 'Topics' ) }
					</NavItem>
					<NavItem path="/tags" selected={ current === 'tags' }>
						{ this.props.translate( 'Tags' ) }
					</NavItem>
				</NavTabs>
			</SectionNav>
		);
	}
}

export default localize( RecommendedNavigation );
