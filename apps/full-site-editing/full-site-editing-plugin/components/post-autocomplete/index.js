/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { debounce, map } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Button, Popover, Spinner, TextControl } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';

const updateSuggestions = debounce( async ( search, postType, setState ) => {
	setState( {
		loading: true,
		showSuggestions: true,
		suggestions: [],
	} );

	const suggestions = await apiFetch( {
		path: addQueryArgs( '/wp/v2/search', {
			context: 'embed',
			per_page: 20,
			search,
			...( !! postType && { subtype: postType } ),
		} ),
	} );

	setState( {
		loading: false,
		showSuggestions: true,
		suggestions,
	} );
}, 200 );

const selectSuggestion = ( { id, title, subtype: type }, setState, setSearch ) => {
	setState( {
		loading: false,
		showSuggestions: false,
		suggestions: [],
	} );
	setSearch( title );

	return { id, type };
};

/**
 * External props:
 * @param {Function} onSelectPost Callback invoked when a post is selected, returning its object.
 * @param {?string|Array} postType If set, limits the search to the given post type, or array of post types.
 * @param {?string} initialValue If set, is the initial value of the input field.
 */
const PostAutocomplete = withState( {
	loading: false,
	showSuggestions: false,
	suggestions: [],
} )(
	( { initialValue, loading, onSelectPost, postType, setState, showSuggestions, suggestions } ) => {
		const [ search, setSearch ] = useState( initialValue );

		const onChange = inputValue => {
			setSearch( inputValue );
			if ( inputValue.length < 2 ) {
				setState( {
					loading: false,
					showSuggestions: false,
				} );
				return;
			}
			updateSuggestions( inputValue, postType, setState );
		};

		const onClick = suggestion => () => {
			const selectedPost = selectSuggestion( suggestion, setState, setSearch );
			onSelectPost( selectedPost );
		};

		return (
			<div className="a8c-post-autocomplete">
				<TextControl
					autoComplete="off"
					onChange={ onChange }
					placeholder={ __( 'Type to search' ) }
					type="search"
					value={ search }
				/>
				{ loading && <Spinner /> }
				{ showSuggestions && !! suggestions.length && (
					<Popover focusOnMount={ false } noArrow position="bottom">
						<div className="a8c-post-autocomplete__suggestions">
							{ map( suggestions, suggestion => (
								<Button isLarge isLink key={ suggestion.id } onClick={ onClick( suggestion ) }>
									{ suggestion.title }
								</Button>
							) ) }
						</div>
					</Popover>
				) }
			</div>
		);
	}
);

export default PostAutocomplete;
