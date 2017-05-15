/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import SearchCollection from './search-collection';
import SearchCard from 'components/search-card';
import HeaderCake from 'components/header-cake';
import { examples } from './examples';
import Main from 'components/main';

export default class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';

	constructor( props ) {
		super( props );
		this.state = { filter: '' };
		this.backToComponents = this.backToComponents.bind( this );
	}

	onSearch( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	}

	backToComponents() {
		page( '/devdocs/design/' );
	}

	renderExamples() {
		return examples.map( Example => {
			const name = ( Example.displayName || Example.name ).replace( /Example$/, '' );
			return <Example key={ name } />;
		} );
	}

	render() {
		const { component } = this.props;
		const { filter } = this.state;

		return (
			<Main className="design">
				{ component
					? <HeaderCake onClick={ this.backToComponents } backText="All Components">
						{ slugToCamelCase( component ) }
					</HeaderCake>

					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ filter }
						placeholder="Search components…"
						analyticsGroup="Docs" />
				}

				<SearchCollection
					component={ component }
					filter={ filter }
				>
					{ this.renderExamples() }
				</SearchCollection>
			</Main>
		);
	}
}
