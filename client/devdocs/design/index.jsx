/**
 * External dependencies
 */
import trim from 'lodash/trim';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import SearchCollection from './search-collection';
import SearchCard from 'components/search-card';
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
		const { filter } = this.state;

		return (
			<Main className="design">
				<SearchCard
					onSearch={ this.onSearch }
					initialValue={ filter }
					placeholder="Search components…"
					analyticsGroup="Docs" />

				<SearchCollection filter={ filter }>
					{ this.renderExamples() }
				</SearchCollection>
			</Main>
		);
	}
}
