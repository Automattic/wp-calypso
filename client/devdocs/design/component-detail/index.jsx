/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import JSXTreeRenderer from 'components/jsx-tree-renderer';
import HeaderCake from 'components/header-cake';
import { findExample } from '../examples';
import Main from 'components/main';

export default class DesignAssets extends React.Component {
	static displayName = 'ComponentDetail';

	componentDidMount() {
		this.refs.tree.setTarget( this.refs.example );
	}

	backToComponents() {
		page( '/devdocs/design/' );
	}

	render() {
		const { component } = this.props;
		const Example = findExample( component );
		const name = getName( Example );

		return (
			<Main className="component-detail">
				<HeaderCake onClick={ this.backToComponents } backText="All Components">
					{ name }
				</HeaderCake>
				<h1 className="component-detail__title">{ name }</h1>
				<div className="component-detail__example">
					<Example ref="example" />
				</div>
				<JSXTreeRenderer ref="tree" className="component-detail__tree" />
			</Main>
		);
	}
}

function getName( Component ) {
	return ( Component.displayName || Component.name || '' )
		.replace( /Example$/, '' );
}
