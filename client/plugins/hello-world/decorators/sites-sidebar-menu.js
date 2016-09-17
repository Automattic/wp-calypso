/**
 * External dependencies
 */
import React from 'react';

// import SidebarItem from 'layout/sidebar/item';
import SitesSidebarMenu from 'my-sites/sidebar/menu';

export default class PostCommentContent extends React.Component {
	render() {
		const children = Array.from( this.props.extraChildren ).concat( <p>Hellow World</p> );
		return <SitesSidebarMenu { ...this.props } extraChidren={ children } />;
	}
}
