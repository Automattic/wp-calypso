/**
 * External dependencies
 */
import createReactClass from 'create-react-class';
import debug from 'debug';
import PropTypes from 'prop-types';
import React from 'react';
import { isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import DocService from './service';
import Card from 'components/card';
import Main from 'components/main';
import SearchCard from 'components/search-card';

/**
 * Constants
 */

const DEFAULT_FILES = [
	'docs/guide/index.md',
	'README.md',
	'.github/CONTRIBUTING.md',
	'docs/coding-guidelines.md',
	'docs/coding-guidelines/javascript.md',
	'docs/coding-guidelines/css.md',
	'docs/coding-guidelines/html.md'
];

/**
 * Module variables
 */

const log = debug( 'calypso:devdocs' );

export default createReactClass( {
	displayName: 'Devdocs',
	propTypes: {
		term: PropTypes.string
	},

	getDefaultProps: function() {
		return {
			term: ''
		};
	},

	getInitialState: function() {
		return {
			term: this.props.term,
			results: [],
			defaultResults: [],
			inputValue: '',
			searching: false
		};
	},

	// load default files if not already cached
	loadDefaultFiles: function() {
		if ( this.state.defaultResults.length ) {
			return;
		}

		DocService.list( DEFAULT_FILES, function( err, results ) {
			if ( ! err && this.isMounted() ) {
				this.setState( {
					defaultResults: results
				} );
			}
		}.bind( this ) );
	},

	componentDidMount: function() {
		const { term } = this.state;
		this.loadDefaultFiles();
		if ( ! term ) {
			return;
		}
		this.onSearchChange( this.state.term );
		this.onSearch( this.state.term );
	},

	componentDidUpdate: function() {
		if ( isFunction( this.props.onSearchChange ) ) {
			this.props.onSearchChange( this.state.term );
		}
	},

	notFound: function() {
		return this.state.inputValue && this.state.term && ! this.state.results.length && ! this.state.searching;
	},

	onSearchChange: function( term ) {
		this.setState( {
			inputValue: term,
			term: term,
			searching: !! term
		} );
	},

	onSearch: function( term ) {
		if ( ! term ) {
			return;
		}
		DocService.search( term, function( err, results ) {
			if ( err ) {
				log( 'search error: %o', err );
			}

			this.setState( {
				results: results,
				searching: false
			} );
		}.bind( this ) );
	},

	results: function() {
		let searchResults;

		if ( this.notFound() ) {
			return <p>Not Found</p>;
		}

		searchResults = this.state.inputValue ? this.state.results : this.state.defaultResults;
		return searchResults.map( function( result ) {
			let url = '/devdocs/' + result.path;

			if ( this.state.term ) {
				url += '?term=' + encodeURIComponent( this.state.term );
			}

			return (
				<Card compact className="devdocs__result" key={ result.path }>
					<header className="devdocs__result-header">
						<h1 className="devdocs__result-title">
							<a className="devdocs__result-link" href={ url }>{ result.title }</a>
						</h1>
						<h2 className="devdocs__result-path">{ result.path }</h2>
					</header>
					{ this.snippet( result ) }
				</Card>
			);
		}, this );
	},

	snippet: function( result ) {
		// split around <mark> tags to avoid setting unescaped inner HTML
		const parts = result.snippet.split( /(<mark>.*?<\/mark>)/ );

		return (
			<div className="devdocs__result-snippet" key={ 'snippet' + result.path }>
				{ parts.map( function( part, i ) {
					const markMatch = part.match( /<mark>(.*?)<\/mark>/ );
					if ( markMatch ) {
						return <mark key={ 'mark' + i }>{ markMatch[ 1 ] }</mark>;
					} else {
						return part;
					}
				} ) }
			</div>
		);
	},

	render: function() {
		return (
			<Main className="devdocs">
				<SearchCard
					autoFocus
					placeholder="Search documentation…"
					analyticsGroup="Docs"
					initialValue={ this.state.term }
					delaySearch={ true }
					onSearchChange={ this.onSearchChange }
					onSearch={ this.onSearch }
				/>
				<div className="devdocs__results">
					{ this.results() }
				</div>
			</Main>
		);
	}
} );
