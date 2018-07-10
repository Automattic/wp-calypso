/**
 * External dependencies
 */
import { isEmpty, get, unescape as unescapeString, find, throttle, uniqBy, invoke } from 'lodash';
import { stringify } from 'querystring';

/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
import { Component, compose } from '@wordpress/element';
import { FormTokenField, withAPIData } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import apiRequest from '@wordpress/api-request';

/**
 * Module constants
 */
const DEFAULT_QUERY = {
	per_page: -1,
	orderby: 'count',
	order: 'desc',
	_fields: 'id,name',
};
const MAX_TERMS_SUGGESTIONS = 20;
const isSameTermName = ( termA, termB ) => termA.toLowerCase() === termB.toLowerCase();

class FlatTermSelector extends Component {
	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.searchTerms = throttle( this.searchTerms.bind( this ), 500 );
		this.findOrCreateTerm = this.findOrCreateTerm.bind( this );
		this.state = {
			loading: false,
			availableTerms: [],
			selectedTerms: [],
		};
	}

	componentDidMount() {
		if ( ! isEmpty( this.props.terms ) ) {
			this.setState( { loading: false } );
			this.initRequest = this.fetchTerms( {
				include: this.props.terms.join( ',' ),
				per_page: 100,
			} );
			this.initRequest.then(
				() => {
					this.setState( { loading: false } );
				},
				( xhr ) => {
					if ( xhr.statusText === 'abort' ) {
						return;
					}
					this.setState( {
						loading: false,
					} );
				}
			);
		}
		this.searchTerms();
	}

	componentWillUnmount() {
		invoke( this.initRequest, [ 'abort' ] );
		invoke( this.searchRequest, [ 'abort' ] );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.terms !== this.props.terms ) {
			this.updateSelectedTerms( this.props.terms );
		}
	}

	fetchTerms( params = {} ) {
		const query = { ...DEFAULT_QUERY, ...params };
		const basePath = wp.api.getTaxonomyRoute( this.props.slug );
		const request = apiRequest( { path: `/wp/v2/${ basePath }?${ stringify( query ) }` } );
		request.then( ( terms ) => {
			this.setState( ( state ) => ( {
				availableTerms: state.availableTerms.concat(
					terms.filter( ( term ) => ! find( state.availableTerms, ( availableTerm ) => availableTerm.id === term.id ) )
				),
			} ) );
			this.updateSelectedTerms( this.props.terms );
		} );

		return request;
	}

	updateSelectedTerms( terms = [] ) {
		const selectedTerms = terms.reduce( ( result, termId ) => {
			const termObject = find( this.state.availableTerms, ( term ) => term.id === termId );
			if ( termObject ) {
				result.push( termObject.name );
			}

			return result;
		}, [] );
		this.setState( {
			selectedTerms,
		} );
	}

	findOrCreateTerm( termName ) {
		return new Promise( ( resolve, reject ) => {
			// Tries to create a term or fetch it if it already exists
			const basePath = wp.api.getTaxonomyRoute( this.props.slug );
			apiRequest( {
				path: `/wp/v2/${ basePath }`,
				method: 'POST',
				data: { name: termName },
			} ).then( resolve, ( xhr ) => {
				const errorCode = xhr.responseJSON && xhr.responseJSON.code;
				if ( errorCode === 'term_exists' ) {
					// search the new category created since last fetch
					this.addRequest = apiRequest( {
						path: `/wp/v2/${ basePath }?${ stringify( { ...DEFAULT_QUERY, search: termName } ) }`,
					} );
					return this.addRequest.then( ( searchResult ) => {
						resolve( find( searchResult, ( result ) => isSameTermName( result.name, termName ) ) );
					}, reject );
				}
				reject( xhr );
			} );
		} );
	}

	onChange( termNames ) {
		const uniqueTerms = uniqBy( termNames, ( term ) => term.toLowerCase() );
		this.setState( { selectedTerms: uniqueTerms } );
		const newTermNames = uniqueTerms.filter( ( termName ) =>
			! find( this.state.availableTerms, ( term ) => isSameTermName( term.name, termName ) )
		);
		const termNamesToIds = ( names, availableTerms ) => {
			return names
				.map( ( termName ) =>
					find( availableTerms, ( term ) => isSameTermName( term.name, termName ) ).id
				);
		};

		if ( newTermNames.length === 0 ) {
			return this.props.onUpdateTerms( termNamesToIds( uniqueTerms, this.state.availableTerms ), this.props.restBase );
		}
		Promise
			.all( newTermNames.map( this.findOrCreateTerm ) )
			.then( ( newTerms ) => {
				const newAvailableTerms = this.state.availableTerms.concat( newTerms );
				this.setState( { availableTerms: newAvailableTerms } );
				return this.props.onUpdateTerms( termNamesToIds( uniqueTerms, newAvailableTerms ), this.props.restBase );
			} );
	}

	searchTerms( search = '' ) {
		invoke( this.searchRequest, [ 'abort' ] );
		this.searchRequest = this.fetchTerms( { search } );
	}

	render() {
		const { slug, taxonomy, hasAssignAction } = this.props;

		if ( ! hasAssignAction ) {
			return null;
		}

		const { loading, availableTerms, selectedTerms } = this.state;
		const termNames = availableTerms.map( ( term ) => term.name );
		const newTermPlaceholderLabel = get(
			taxonomy,
			[ 'data', 'labels', 'add_new_item' ],
			slug === 'post_tag' ? __( 'Add New Tag' ) : __( 'Add New Term' )
		);
		const singularName = get(
			taxonomy,
			[ 'data', 'labels', 'singular_name' ],
			slug === 'post_tag' ? __( 'Tag' ) : __( 'Term' )
		);
		const termAddedLabel = sprintf( _x( '%s added', 'term' ), singularName );
		const termRemovedLabel = sprintf( _x( '%s removed', 'term' ), singularName );
		const removeTermLabel = sprintf( _x( 'Remove %s', 'term' ), singularName );

		return (
			<FormTokenField
				value={ selectedTerms }
				displayTransform={ unescapeString }
				suggestions={ termNames }
				onChange={ this.onChange }
				onInputChange={ this.searchTerms }
				maxSuggestions={ MAX_TERMS_SUGGESTIONS }
				disabled={ loading }
				placeholder={ newTermPlaceholderLabel }
				messages={ {
					added: termAddedLabel,
					removed: termRemovedLabel,
					remove: removeTermLabel,
				} }
			/>
		);
	}
}

export default compose(
	withAPIData( ( props ) => {
		const { slug } = props;
		return {
			taxonomy: `/wp/v2/taxonomies/${ slug }?context=edit`,
		};
	} ),
	withSelect( ( select, ownProps ) => {
		const { getCurrentPost } = select( 'core/editor' );
		return {
			hasCreateAction: get( getCurrentPost(), [ '_links', 'wp:action-create-' + ownProps.restBase ], false ),
			hasAssignAction: get( getCurrentPost(), [ '_links', 'wp:action-assign-' + ownProps.restBase ], false ),
			terms: select( 'core/editor' ).getEditedPostAttribute( ownProps.restBase ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		return {
			onUpdateTerms( terms, restBase ) {
				dispatch( 'core/editor' ).editPost( { [ restBase ]: terms } );
			},
		};
	} )
)( FlatTermSelector );
