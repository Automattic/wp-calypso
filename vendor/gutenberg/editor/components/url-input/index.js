/**
 * External dependencies
 */
import { throttle } from 'lodash';
import classnames from 'classnames';
import scrollIntoView from 'dom-scroll-into-view';
import { stringify } from 'querystringify';

/**
 * WordPress dependencies
 */
import { __, sprintf, _n } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { decodeEntities } from '@wordpress/utils';
import { UP, DOWN, ENTER } from '@wordpress/keycodes';
import { Spinner, withInstanceId, withSpokenMessages, Popover } from '@wordpress/components';
import apiRequest from '@wordpress/api-request';

// Since URLInput is rendered in the context of other inputs, but should be
// considered a separate modal node, prevent keyboard events from propagating
// as being considered from the input.
const stopEventPropagation = ( event ) => event.stopPropagation();

class UrlInput extends Component {
	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.bindListNode = this.bindListNode.bind( this );
		this.updateSuggestions = throttle( this.updateSuggestions.bind( this ), 200 );
		this.suggestionNodes = [];
		this.state = {
			posts: [],
			showSuggestions: false,
			selectedSuggestion: null,
		};
	}

	bindListNode( ref ) {
		this.listNode = ref;
	}

	bindSuggestionNode( index ) {
		return ( ref ) => {
			this.suggestionNodes[ index ] = ref;
		};
	}

	updateSuggestions( value ) {
		if ( this.suggestionsRequest ) {
			this.suggestionsRequest.abort();
		}

		// Show the suggestions after typing at least 2 characters
		// and also for URLs
		if ( value.length < 2 || /^https?:/.test( value ) ) {
			this.setState( {
				showSuggestions: false,
				selectedSuggestion: null,
				loading: false,
			} );

			return;
		}

		this.setState( {
			showSuggestions: true,
			selectedSuggestion: null,
			loading: true,
		} );
		this.suggestionsRequest = apiRequest( {
			path: `/wp/v2/posts?${ stringify( {
				search: value,
				per_page: 20,
				orderby: 'relevance',
			} ) }`,
		} );

		this.suggestionsRequest
			.then(
				( posts ) => {
					this.setState( {
						posts,
						loading: false,
					} );

					if ( !! posts.length ) {
						this.props.debouncedSpeak( sprintf( _n(
							'%d result found, use up and down arrow keys to navigate.',
							'%d results found, use up and down arrow keys to navigate.',
							posts.length
						), posts.length ), 'assertive' );
					} else {
						this.props.debouncedSpeak( __( 'No results.' ), 'assertive' );
					}
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

	onChange( event ) {
		const inputValue = event.target.value;
		this.props.onChange( inputValue );
		this.updateSuggestions( inputValue );
	}

	onKeyDown( event ) {
		const { showSuggestions, selectedSuggestion, posts, loading } = this.state;
		// If the suggestions are not shown or loading, we shouldn't handle the arrow keys
		// We shouldn't preventDefault to allow block arrow keys navigation
		if ( ! showSuggestions || ! posts.length || loading ) {
			return;
		}

		switch ( event.keyCode ) {
			case UP: {
				event.stopPropagation();
				event.preventDefault();
				const previousIndex = ! selectedSuggestion ? posts.length - 1 : selectedSuggestion - 1;
				this.setState( {
					selectedSuggestion: previousIndex,
				} );
				break;
			}
			case DOWN: {
				event.stopPropagation();
				event.preventDefault();
				const nextIndex = selectedSuggestion === null || ( selectedSuggestion === posts.length - 1 ) ? 0 : selectedSuggestion + 1;
				this.setState( {
					selectedSuggestion: nextIndex,
				} );
				break;
			}
			case ENTER: {
				if ( this.state.selectedSuggestion ) {
					event.stopPropagation();
					const post = this.state.posts[ this.state.selectedSuggestion ];
					this.selectLink( post.link );
				}
			}
		}
	}

	selectLink( link ) {
		this.props.onChange( link );
		this.setState( {
			selectedSuggestion: null,
			showSuggestions: false,
		} );
	}

	componentWillUnmount() {
		if ( this.suggestionsRequest ) {
			this.suggestionsRequest.abort();
		}
	}

	componentDidUpdate() {
		const { showSuggestions, selectedSuggestion } = this.state;
		// only have to worry about scrolling selected suggestion into view
		// when already expanded
		if ( showSuggestions && selectedSuggestion !== null && ! this.scrollingIntoView ) {
			this.scrollingIntoView = true;
			scrollIntoView( this.suggestionNodes[ selectedSuggestion ], this.listNode, {
				onlyScrollIfNeeded: true,
			} );

			setTimeout( () => {
				this.scrollingIntoView = false;
			}, 100 );
		}
	}

	render() {
		const { value = '', autoFocus = true, instanceId } = this.props;
		const { showSuggestions, posts, selectedSuggestion, loading } = this.state;
		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<Fragment>
				<div className="editor-url-input">
					<input
						autoFocus={ autoFocus }
						type="text"
						aria-label={ __( 'URL' ) }
						required
						value={ value }
						onChange={ this.onChange }
						onInput={ stopEventPropagation }
						placeholder={ __( 'Paste URL or type' ) }
						onKeyDown={ this.onKeyDown }
						role="combobox"
						aria-expanded={ showSuggestions }
						aria-autocomplete="list"
						aria-owns={ `editor-url-input-suggestions-${ instanceId }` }
						aria-activedescendant={ selectedSuggestion !== null ? `editor-url-input-suggestion-${ instanceId }-${ selectedSuggestion }` : undefined }
					/>

					{ ( loading ) && <Spinner /> }
				</div>

				{ showSuggestions && !! posts.length &&
					<Popover position="bottom" noArrow focusOnMount={ false }>
						<div
							className="editor-url-input__suggestions"
							id={ `editor-url-input-suggestions-${ instanceId }` }
							ref={ this.bindListNode }
							role="listbox"
						>
							{ posts.map( ( post, index ) => (
								<button
									key={ post.id }
									role="option"
									tabIndex="-1"
									id={ `editor-url-input-suggestion-${ instanceId }-${ index }` }
									ref={ this.bindSuggestionNode( index ) }
									className={ classnames( 'editor-url-input__suggestion', {
										'is-selected': index === selectedSuggestion,
									} ) }
									onClick={ () => this.selectLink( post.link ) }
									aria-selected={ index === selectedSuggestion }
								>
									{ decodeEntities( post.title.rendered ) || __( '(no title)' ) }
								</button>
							) ) }
						</div>
					</Popover>
				}
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

export default withSpokenMessages( withInstanceId( UrlInput ) );
