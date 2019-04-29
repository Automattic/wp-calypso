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
import fetchPost from '../../lib/fetch-post';
import './style.scss';

const updateSuggestions = debounce( async ( search, setState ) => {
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
		} ),
	} );

	setState( {
		loading: false,
		showSuggestions: true,
		suggestions,
	} );
}, 200 );

const selectSuggestion = async ( suggestion, setState ) => {
	setState( {
		loading: true,
		search: suggestion.title,
		showSuggestions: false,
		suggestions: [],
	} );

	const selectedPost = await fetchPost( suggestion.id, suggestion.subtype );

	setState( {
		loading: false,
	} );

	return selectedPost;
};
const PostAutocomplete = withState( {
	loading: false,
	search: null,
	showSuggestions: false,
	suggestions: [],
} )(
	( {
		loading,
		onSelectPost,
		search,
		selectedPostTitle,
		setState,
		showSuggestions,
		suggestions,
	} ) => {
		const onChange = inputValue => {
			setState( { search: inputValue } );
			if ( inputValue.length < 2 ) {
				setState( {
					loading: false,
					showSuggestions: false,
				} );
				return;
			}
			updateSuggestions( inputValue, setState );
		};

		const onClick = suggestion => async () => {
			const selectedPost = await selectSuggestion( suggestion, setState );
			onSelectPost( selectedPost );
		};

		return (
			<div className="a8c-post-autocomplete">
				<TextControl
					autocomplete="off"
					onChange={ onChange }
					placeholder={ __( 'Type to search' ) }
					type="search"
					value={ search !== null ? search : selectedPostTitle }
				/>
				{ loading && <Spinner /> }
				{ showSuggestions && !! suggestions.length && (
					<Popover focusOnMount={ false } noArrow position="bottom">
						<div className="a8c-post-autocomplete__suggestions">
							{ map( suggestions, suggestion => (
								<Button isLarge isLink onClick={ onClick( suggestion ) }>
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
