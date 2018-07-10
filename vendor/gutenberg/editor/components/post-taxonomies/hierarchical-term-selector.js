/**
 * External dependencies
 */
import { get, unescape as unescapeString, without, find, some, invoke } from 'lodash';
import { stringify } from 'querystring';

/**
 * WordPress dependencies
 */
import { __, _x, sprintf } from '@wordpress/i18n';
import { Component, compose } from '@wordpress/element';
import { TreeSelect, withAPIData, withInstanceId, withSpokenMessages, Button } from '@wordpress/components';
import { buildTermsTree } from '@wordpress/utils';
import { withSelect, withDispatch } from '@wordpress/data';
import apiRequest from '@wordpress/api-request';

/**
 * Module Constants
 */
const DEFAULT_QUERY = {
	per_page: -1,
	orderby: 'count',
	order: 'desc',
	_fields: 'id,name,parent',
};

class HierarchicalTermSelector extends Component {
	constructor() {
		super( ...arguments );
		this.findTerm = this.findTerm.bind( this );
		this.onChange = this.onChange.bind( this );
		this.onChangeFormName = this.onChangeFormName.bind( this );
		this.onChangeFormParent = this.onChangeFormParent.bind( this );
		this.onAddTerm = this.onAddTerm.bind( this );
		this.onToggleForm = this.onToggleForm.bind( this );
		this.state = {
			loading: true,
			availableTermsTree: [],
			availableTerms: [],
			adding: false,
			formName: '',
			formParent: '',
			showForm: false,
		};
	}

	onChange( event ) {
		const { onUpdateTerms, terms = [], restBase } = this.props;
		const termId = parseInt( event.target.value, 10 );
		const hasTerm = terms.indexOf( termId ) !== -1;
		const newTerms = hasTerm ?
			without( terms, termId ) :
			[ ...terms, termId ];
		onUpdateTerms( newTerms, restBase );
	}

	onChangeFormName( event ) {
		const newValue = event.target.value.trim() === '' ? '' : event.target.value;
		this.setState( { formName: newValue } );
	}

	onChangeFormParent( newParent ) {
		this.setState( { formParent: newParent } );
	}

	onToggleForm() {
		this.setState( ( state ) => ( {
			showForm: ! state.showForm,
		} ) );
	}

	findTerm( terms, parent, name ) {
		return find( terms, ( term ) => {
			return ( ( ! term.parent && ! parent ) || parseInt( term.parent ) === parseInt( parent ) ) &&
				term.name.toLowerCase() === name.toLowerCase();
		} );
	}

	onAddTerm( event ) {
		event.preventDefault();
		const { onUpdateTerms, restBase, terms, slug } = this.props;
		const { formName, formParent, adding, availableTerms } = this.state;
		if ( formName === '' || adding ) {
			return;
		}

		// check if the term we are adding already exists
		const existingTerm = this.findTerm( availableTerms, formParent, formName );
		if ( existingTerm ) {
			// if the term we are adding exists but is not selected select it
			if ( ! some( terms, ( term ) => term === existingTerm.id ) ) {
				onUpdateTerms( [ ...terms, existingTerm.id ], restBase );
			}
			this.setState( {
				formName: '',
				formParent: '',
			} );
			return;
		}

		const findOrCreatePromise = new Promise( ( resolve, reject ) => {
			this.setState( {
				adding: true,
			} );
			// Tries to create a term or fetch it if it already exists
			const basePath = wp.api.getTaxonomyRoute( this.props.slug );
			this.addRequest = apiRequest( {
				path: `/wp/v2/${ basePath }`,
				method: 'POST',
				data: {
					name: formName,
					parent: formParent ? formParent : undefined,
				},
			} );
			this.addRequest
				.then( resolve, ( xhr ) => {
					const errorCode = xhr.responseJSON && xhr.responseJSON.code;
					if ( errorCode === 'term_exists' ) {
						// search the new category created since last fetch
						this.addRequest = apiRequest( {
							path: `/wp/v2/${ basePath }?${ stringify( { ...DEFAULT_QUERY, parent: formParent || 0, search: formName } ) }`,
						} );
						return this.addRequest.then( ( searchResult ) => {
							resolve( this.findTerm( searchResult, formParent, formName ) );
						}, reject );
					}
					reject( xhr );
				} );
		} );
		findOrCreatePromise
			.then( ( term ) => {
				const hasTerm = !! find( this.state.availableTerms, ( availableTerm ) => availableTerm.id === term.id );
				const newAvailableTerms = hasTerm ? this.state.availableTerms : [ term, ...this.state.availableTerms ];
				const termAddedMessage = sprintf(
					_x( '%s added', 'term' ),
					get(
						this.props.taxonomy,
						[ 'data', 'labels', 'singular_name' ],
						slug === 'category' ? __( 'Category' ) : __( 'Term' )
					)
				);
				this.props.speak( termAddedMessage, 'assertive' );
				this.addRequest = null;
				this.setState( {
					adding: false,
					formName: '',
					formParent: '',
					availableTerms: newAvailableTerms,
					availableTermsTree: buildTermsTree( newAvailableTerms ),
				} );
				onUpdateTerms( [ ...terms, term.id ], restBase );
			}, ( xhr ) => {
				if ( xhr.statusText === 'abort' ) {
					return;
				}
				this.addRequest = null;
				this.setState( {
					adding: false,
				} );
			} );
	}

	componentDidMount() {
		const basePath = wp.api.getTaxonomyRoute( this.props.slug );
		this.fetchRequest = apiRequest( { path: `/wp/v2/${ basePath }?${ stringify( DEFAULT_QUERY ) }` } );
		this.fetchRequest.then(
			( terms ) => { // resolve
				const availableTermsTree = buildTermsTree( terms );

				this.fetchRequest = null;
				this.setState( {
					loading: false,
					availableTermsTree,
					availableTerms: terms,
				} );
			},
			( xhr ) => { // reject
				if ( xhr.statusText === 'abort' ) {
					return;
				}
				this.fetchRequest = null;
				this.setState( {
					loading: false,
				} );
			}
		);
	}

	componentWillUnmount() {
		invoke( this.fetchRequest, [ 'abort' ] );
		invoke( this.addRequest, [ 'abort' ] );
	}

	renderTerms( renderedTerms ) {
		const { terms = [] } = this.props;
		return renderedTerms.map( ( term ) => {
			const id = `editor-post-taxonomies-hierarchical-term-${ term.id }`;
			return (
				<div key={ term.id } className="editor-post-taxonomies__hierarchical-terms-choice">
					<input
						id={ id }
						className="editor-post-taxonomies__hierarchical-terms-input"
						type="checkbox"
						checked={ terms.indexOf( term.id ) !== -1 }
						value={ term.id }
						onChange={ this.onChange }
					/>
					<label htmlFor={ id }>{ unescapeString( term.name ) }</label>
					{ !! term.children.length && (
						<div className="editor-post-taxonomies__hierarchical-terms-subchoices">
							{ this.renderTerms( term.children ) }
						</div>
					) }
				</div>
			);
		} );
	}

	render() {
		const { slug, taxonomy, instanceId, hasCreateAction, hasAssignAction } = this.props;

		if ( ! hasAssignAction ) {
			return null;
		}

		const { availableTermsTree, availableTerms, formName, formParent, loading, showForm } = this.state;
		const labelWithFallback = ( labelProperty, fallbackIsCategory, fallbackIsNotCategory ) => get(
			taxonomy,
			[ 'data', 'labels', labelProperty ],
			slug === 'category' ? fallbackIsCategory : fallbackIsNotCategory
		);
		const newTermButtonLabel = labelWithFallback(
			'add_new_item',
			__( 'Add new category' ),
			__( 'Add new term' )
		);
		const newTermLabel = labelWithFallback(
			'new_item_name',
			__( 'Add new category' ),
			__( 'Add new term' )
		);
		const parentSelectLabel = labelWithFallback(
			'parent_item',
			__( 'Parent Category' ),
			__( 'Parent Term' )
		);
		const noParentOption = `— ${ parentSelectLabel } —`;
		const newTermSubmitLabel = newTermButtonLabel;
		const inputId = `editor-post-taxonomies__hierarchical-terms-input-${ instanceId }`;

		/* eslint-disable jsx-a11y/no-onchange */
		return [
			...this.renderTerms( availableTermsTree ),
			! loading && hasCreateAction && (
				<Button
					key="term-add-button"
					onClick={ this.onToggleForm }
					className="editor-post-taxonomies__hierarchical-terms-add"
					aria-expanded={ showForm }
					isLink
				>
					{ newTermButtonLabel }
				</Button>
			),
			showForm && (
				<form onSubmit={ this.onAddTerm } key="hierarchical-terms-form">
					<label
						htmlFor={ inputId }
						className="editor-post-taxonomies__hierarchical-terms-label"
					>
						{ newTermLabel }
					</label>
					<input
						type="text"
						id={ inputId }
						className="editor-post-taxonomies__hierarchical-terms-input"
						value={ formName }
						onChange={ this.onChangeFormName }
						required
					/>
					{ !! availableTerms.length &&
						<TreeSelect
							label={ parentSelectLabel }
							noOptionLabel={ noParentOption }
							onChange={ this.onChangeFormParent }
							selectedId={ formParent }
							tree={ availableTermsTree }
						/>
					}
					<Button
						isDefault
						type="submit"
						className="editor-post-taxonomies__hierarchical-terms-submit"
					>
						{ newTermSubmitLabel }
					</Button>
				</form>
			),
		];
		/* eslint-enable jsx-a11y/no-onchange */
	}
}

export default compose( [
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
	withDispatch( ( dispatch ) => ( {
		onUpdateTerms( terms, restBase ) {
			dispatch( 'core/editor' ).editPost( { [ restBase ]: terms } );
		},
	} ) ),
	withSpokenMessages,
	withInstanceId,
] )( HierarchicalTermSelector );
