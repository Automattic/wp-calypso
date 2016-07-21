/**
* External dependencies
*/
import React from 'react';
import { invoke } from 'lodash';

/**
* Internal dependencies
*/
import config from 'config';

const Hider = React.createClass( {
	displayName: 'Hider',

	propTypes: {
		hide: React.PropTypes.bool,
	},

	shouldComponentUpdate( nextProps ) {
		return this.props.hide !== nextProps.hide;
	},

	render() {
		return (
			<div
				className={ config.isEnabled( 'devdocs/usage-counts' ) ? 'design-assets__group' : null }
				style={ this.props.hide ? { display: 'none' } : {} }
			>
				{ this.props.children }
			</div>
		);
	}
} );

const FilterSummary = React.createClass( {
	render() {
		let names;

		if ( this.props.items.length === 0 ) {
			return ( <p>No matches found</p> );
		} else if ( this.props.items.length === this.props.total || this.props.items.length === 1 ) {
			return null;
		}

		names = this.props.items.map( function( item ) {
			return item.props.children.type.displayName;
		} );

		return (
			<p>Showing: { names.join( ', ' ) }</p>
		);
	}
} );

export default React.createClass( {
	displayName: 'Collection',

	shouldWeHide: function( example ) {
		let filter, searchString;

		filter = this.props.filter || '';
		searchString = example.type.displayName;

		if ( this.props.component ) {
			const exampleName = invoke( example, 'type.displayName.toLowerCase' );
			const componentName = invoke( this, 'props.component.replace', /-([a-z])/g, '$1' );

			return exampleName !== componentName;
		}

		if ( example.props.searchKeywords ) {
			searchString += ' ' + example.props.searchKeywords;
		}

		return ! ( ! filter || searchString.toLowerCase().indexOf( filter ) > -1 );
	},

	visibleExamples: function( examples ) {
		return examples.filter( ( child ) => {
			return !child.props.hide;
		} );
	},

	render: function() {
		let summary, examples;

		examples = React.Children.map( this.props.children, ( example ) => {
			return (
				<Hider hide={ this.shouldWeHide( example ) } key={ 'example-' + example.type.displayName }>
					{ example }
				</Hider>
			);
		} );

		if ( ! this.props.component ) {
			summary = (
				<FilterSummary
					items={ this.visibleExamples( examples ) }
					total={ this.props.children.length } />
			);
		}

		return (
			<div className="collection">
				{ summary }
				{ examples }
			</div>
		);
	}
} );
