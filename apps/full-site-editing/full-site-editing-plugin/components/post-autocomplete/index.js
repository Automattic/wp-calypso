/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { debounce, map } from 'lodash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Button, Popover, Spinner, TextControl } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';

class PostAutocomplete extends Component {
	static propTypes = {
		defaultValue: PropTypes.string,
		onSelectPost: PropTypes.func.isRequired,
		postType: PropTypes.string.isRequired,
	};

	state = {
		loading: false,
		search: '',
		showSuggestions: false,
		suggestions: [],
	};

	componentDidMount() {
		if ( this.props.defaultValue ) {
			// eslint-disable-next-line react/no-did-mount-set-state
			this.setState( { search: this.props.defaultValue } );
		}
	}

	updateSuggestions = debounce( async search => {
		const { postType } = this.props;

		this.setState( {
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

		this.setState( {
			loading: false,
			showSuggestions: true,
			suggestions,
		} );
	}, 200 );

	selectSuggestion = suggestion => {
		this.setState( {
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

	onChange = inputValue => {
		this.setState( { search: inputValue } );
		if ( inputValue.length < 2 ) {
			this.setState( {
				loading: false,
				showSuggestions: false,
			} );
			return;
		}
		this.updateSuggestions( inputValue );
	};

	onClick = suggestion => () => {
		const selectedPost = this.selectSuggestion( suggestion );
		this.props.onSelectPost( selectedPost );
	};

	render() {
		const { loading, search, showSuggestions, suggestions } = this.state;

		return (
			<div className="a8c-post-autocomplete">
				<TextControl
					autoComplete="off"
					onChange={ this.onChange }
					placeholder={ __( 'Type to search' ) }
					type="search"
					value={ search }
				/>
				{ loading && <Spinner /> }
				{ showSuggestions && !! suggestions.length && (
					<Popover focusOnMount={ false } noArrow position="bottom">
						<div className="a8c-post-autocomplete__suggestions">
							{ map( suggestions, suggestion => (
								<Button isLarge isLink key={ suggestion.id } onClick={ this.onClick( suggestion ) }>
									{ suggestion.title }
								</Button>
							) ) }
						</div>
					</Popover>
				) }
			</div>
		);
	}
}

export default PostAutocomplete;
