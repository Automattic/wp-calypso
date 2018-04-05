/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import classnames from 'classnames';
import { trim } from 'lodash';
import { slugToCamelCase } from 'devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import Collection from 'devdocs/design/search-collection';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';
import { isEnabled } from 'config';

/**
 * Examples
 */
import Banner from 'components/banner/docs/example';
import GlobalNotices from 'components/global-notices/docs/example';
import Notices from 'components/notice/docs/example';

export default class AppComponents extends React.Component {
	static displayName = 'AppComponents';
	state = { filter: '' };

	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	backToComponents = () => {
		page( '/devdocs/text/' );
	};

	render() {
		const className = classnames( 'devdocs', 'devdocs__blocks', {
			'is-single': this.props.component,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Blocks" />
				{ this.props.component ? (
					<HeaderCake onClick={ this.backToComponents } backText="All Blocks">
						{ slugToCamelCase( this.props.component ) }
					</HeaderCake>
				) : null }
				<Collection component={ this.props.component } filter={ this.state.filter }>
					<Banner readmeFilePath="banner" />
					<GlobalNotices />
					<Notices />
				</Collection>
			</Main>
		);
	}
}
