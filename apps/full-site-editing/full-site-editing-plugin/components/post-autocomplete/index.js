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

const selectSuggestion = ( suggestion, setState ) => {
	setState( {
		loading: false,
		search: suggestion.title,
		showSuggestions: false,
		suggestions: [],
	} );

	return {
		id: suggestion.id,
		type: suggestion.subtype,
	};
};

/**
 * External props:
 * @param {Function} onSelectPost Callback invoked when a post is selected, returning its object.
 * @param {?string|Array} postType If set, limits the search to the given post type, or array of post types.
 */
const PostAutocomplete = withState( {
	loading: false,
	search: '',
	showSuggestions: false,
	suggestions: [],
} )( ( { loading, onSelectPost, postType, search, setState, showSuggestions, suggestions } ) => {
	const onChange = inputValue => {
		setState( { search: inputValue } );
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
		const selectedPost = selectSuggestion( suggestion, setState );
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
} );

export default PostAutocomplete;
