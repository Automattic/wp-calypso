/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import SegmentedControl from 'components/segmented-control';
import Suggestions from 'components/suggestions';
import config from 'config';
import { isMobile } from 'lib/viewport';
import { filterIsValid, getTaxonomies, } from '../theme-filters.js';
import { localize } from 'i18n-calypso';
import MagicSearchWelcome from './welcome';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class ThemesMagicSearchCard extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			isMobile: isMobile(),
			searchIsOpen: false,
			editedSearchElement: '',
			cursorPosition: 0,
			searchInput: this.props.search,
		};
	}

	componentWillMount() {
		this.onResize = debounce( () => {
			this.setState( { isMobile: isMobile() } );
		}, 250 );
	}

	componentDidMount() {
		this.findTextForSuggestions( this.props.search );
		window.addEventListener( 'resize', this.onResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.onResize );
	}

	onSearchOpen = () => {
		this.setState( { searchIsOpen: true } );
	}

	onSearchClose = () => {
		this.setState( { searchIsOpen: false } );
	}

	onKeyDown = ( event ) => {
		this.findTextForSuggestions( event.target.value );
		this.refs.suggestions.handleKeyEvent( event );
	}

	onClick = ( event ) => {
		this.findTextForSuggestions( event.target.value );
	}

	findEditedTokenIndex = ( tokens, cursorPosition ) => {
		let tokenEnd = 0;
		for ( let i = 0; i < tokens.length; i++ ) {
			tokenEnd += tokens[ i ].length;

			const cursorIsInsideTheToken = cursorPosition < tokenEnd;
			if ( cursorIsInsideTheToken ) {
				// "" indicates full suggestion request
				return i;
			}

			const cursorAtEndOfTheToken = cursorPosition === tokenEnd;
			if ( cursorAtEndOfTheToken ) {
				//If token is whitespace only and we are at its end
				//maybe we are at the start of next token
				const tokenIsWhiteSpace = tokens[ i ].trim() === '';
				//if this one is white space only next
				//next one must be text
				const moreTokensExist = i < tokens.length - 1;
				if ( tokenIsWhiteSpace && moreTokensExist ) {
					return i + 1;
				}
				// "" indicates full suggestion request
				return i;
			}
			continue; // to the next token
		}

		return '';
	}

	findTextForSuggestions = ( input ) => {
		const val = input;
		window.requestAnimationFrame( () => {
			this.setState( { cursorPosition: val.slice( 0, this.refs[ 'url-search' ].refs.searchInput.selectionStart ).length } );
			const tokens = input.split( /(\s+)/ );

			// Get rid of empty match at end
			tokens[ tokens.length - 1 ] === '' && tokens.splice( tokens.length - 1, 1 );
			if ( tokens.length === 0 ) {
				this.setState( { editedSearchElement: '' } );
				return;
			}
			const tokenIndex = this.findEditedTokenIndex( tokens, this.state.cursorPosition );
			const text = tokens[ tokenIndex ].trim();
			this.setState( { editedSearchElement: text } );
		} );
	}

	insertSuggestion = ( suggestion ) => {
		const tokens = this.state.searchInput.split( /(\s+)/ );
		// Get rid of empty match at end
		tokens[ tokens.length - 1 ] === '' && tokens.splice( tokens.length - 1, 1 );
		const tokenIndex = this.findEditedTokenIndex( tokens, this.state.cursorPosition );
		tokens[ tokenIndex ] = suggestion;
		return tokens.join( '' );
	}

	insertTextAtCursor = ( text ) => {
		const input = this.state.searchInput;
		const position = this.state.cursorPosition;
		return input.slice( 0, position ) + text + input.slice( position );
	}

	onSearchChange = ( input ) => {
		this.findTextForSuggestions( input );
		this.setState( { searchInput: input } );
	}

	onBlur = ( event ) => {
		event.preventDefault();
		this.setState( { searchIsOpen: false } );
	}

	searchTokens = ( input ) => {
		//We are not able to scroll overlay on Edge so just create empty div
		if ( global.window && /(Edge)/.test( global.window.navigator.userAgent ) ) {
			return <div />;
		}

		const tokens = input.split( /(\s+)/ );

		return (
			tokens.map( ( token, i ) => {
				if ( token.trim() === '' ) {
					return <span className="themes-magic-search-card__search-white-space" key={ i }>{ token }</span>; // use shortid for key
				} else if ( filterIsValid( token ) ) {
					const separator = ':';
					const [ taxonomy, filter ] = token.split( separator );
					const themesTokenTypeClass = classNames(
						'themes-magic-search-card__token',
						'themes-magic-search-card__token-type-' + taxonomy
					);
					return (
						<span className={ themesTokenTypeClass } key={ i }>
							<span className="themes-magic-search-card__token-taxonomy">{ taxonomy }</span>
							<span className="themes-magic-search-card__token-separator">{ separator }</span>
							<span className="themes-magic-search-card__token-filter">{ filter }</span>
						</span>
					);
				}
				return <span className="themes-magic-search-card__search-text" key={ i }>{ token }</span>; // use shortid for key
			} )
		);
	}

	updateInput = ( updatedInput ) => {
		this.setState( { searchInput: updatedInput } );
		this.refs[ 'url-search' ].clear();
	}

	suggest = ( suggestion ) => {
		const updatedInput = this.insertSuggestion( suggestion );
		this.updateInput( updatedInput );
	}

	insertTextInInput = ( text ) => {
		const updatedInput = this.insertTextAtCursor( text );
		this.updateInput( updatedInput );
	}

	render() {
		const { isJetpack } = this.props;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );
		const { translate } = this.props;

		const tiers = [
			{ value: 'all', label: translate( 'All' ) },
			{ value: 'free', label: translate( 'Free' ) },
			{ value: 'premium', label: translate( 'Premium' ) },
		];

		const taxonomies = getTaxonomies();
		const taxonomiesKeys = Object.keys( taxonomies );
		const welcomeSignProps = {
			taxonomies: taxonomiesKeys,
			topSearches: [],
			suggestionsCallback: this.insertTextInInput
		};

		const searchField = (
			<Search
				onSearch={ this.props.onSearch }
				value={ this.state.searchInput }
				ref="url-search"
				placeholder={ translate( 'What kind of theme are you looking for?' ) }
				analyticsGroup="Themes"
				delaySearch={ true }
				onSearchOpen={ this.onSearchOpen }
				onSearchClose={ this.onSearchClose }
				onSearchChange={ this.onSearchChange }
				onKeyDown={ this.onKeyDown }
				onClick={ this.onClick }
				overlayStyling={ this.searchTokens }
				onBlur={ this.onBlur }
				fitsContainer={ this.state.isMobile && this.state.searchIsOpen }
				hideClose={ isMobile() }
			/>
		);

		const magicSearchClass = classNames( 'themes-magic-search', {
			'has-suggestions': this.state.searchIsOpen
		} );

		const themesSearchCardClass = classNames( 'themes-magic-search-card', {
			'has-highlight': this.state.searchIsOpen
		} );

		const welcome = ( <MagicSearchWelcome { ...welcomeSignProps } /> );

		return (
			<div className={ magicSearchClass }>
				<div className={ themesSearchCardClass } data-tip-target="themes-search-card">
					{ searchField }
					{ isPremiumThemesEnabled && ! isJetpack &&
						<SegmentedControl
							initialSelected={ this.props.tier }
							options={ tiers }
							onSelect={ this.props.select }
						/>
					}
				</div>
				<Suggestions
					ref="suggestions"
					terms={ taxonomies }
					input={ this.state.editedSearchElement }
					suggest={ this.suggest }
					welcomeSign={ welcome }
				/>
			</div>
		);
	}
}

ThemesMagicSearchCard.propTypes = {
	tier: PropTypes.string,
	select: PropTypes.func.isRequired,
	siteId: PropTypes.number,
	onSearch: PropTypes.func.isRequired,
	search: PropTypes.string,
	translate: PropTypes.func.isRequired,
	isJetpack: PropTypes.bool
};

ThemesMagicSearchCard.defaultProps = {
	tier: 'all',
};

export default connect(
	( state ) => ( {
		isJetpack: isJetpackSite( state, getSelectedSiteId( state ) )
	} )
)( localize( ThemesMagicSearchCard ) );
