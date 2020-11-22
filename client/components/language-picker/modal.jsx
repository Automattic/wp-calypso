/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import i18n, { localize } from 'i18n-calypso';
import {
	capitalize,
	deburr,
	find,
	includes,
	isEmpty,
	map,
	noop,
	partial,
	some,
	startsWith,
} from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { Dialog } from '@automattic/components';
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import SectionNav from 'calypso/components/section-nav';
import SectionNavTabs from 'calypso/components/section-nav/tabs';
import SectionNavTabItem from 'calypso/components/section-nav/item';
import Search from 'calypso/components/search';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import LanguagePickerItemTooltip from './tooltip';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import { getLanguageGroupByCountryCode, getLanguageGroupById } from './utils';
import { LANGUAGE_GROUPS, DEFAULT_LANGUAGE_GROUP } from './constants';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import {
	getLanguage,
	isDefaultLocale,
	isTranslatedIncompletely,
} from 'calypso/lib/i18n-utils/utils';
import { requestGeoLocation } from 'calypso/state/data-getters';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './modal.scss';

export class LanguagePickerModal extends PureComponent {
	static propTypes = {
		onSelected: PropTypes.func,
		onClose: PropTypes.func,
		localizedLanguageNames: PropTypes.object,
		isVisible: PropTypes.bool,
		languages: PropTypes.array.isRequired,
		selected: PropTypes.string,
		countryCode: PropTypes.string,
		showEmpathyModeControl: PropTypes.bool,
		empathyMode: PropTypes.bool,
		getIncompleteLocaleNoticeMessage: PropTypes.func,
	};

	static defaultProps = {
		onSelected: noop,
		onClose: noop,
		localizedLanguageNames: {},
		isVisible: false,
		selected: 'en',
		showEmpathyModeControl: config.isEnabled( 'i18n/empathy-mode' ),
		empathyMode: false,
		useFallbackForIncompleteLanguages: false,
	};

	state = {
		empathyMode: this.props.empathyMode,
		filter: getLanguageGroupByCountryCode( this.props.countryCode ),
		isSearchOpen: false,
		recordedTracksSearchEvent: false,
		search: false,
		selectedLanguageSlug: this.props.selected,
		showingDefaultFilter: true,
		suggestedLanguages: this.getSuggestedLanguages(),
		useFallbackForIncompleteLanguages: this.props.useFallbackForIncompleteLanguages,
	};

	initiallySelectedLanguageSlug = this.props.selected;
	languagesList = React.createRef();
	selectedLanguageItem = React.createRef();

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleKeyDown );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.selected !== this.state.selectedLanguageSlug ) {
			this.setState( {
				selectedLanguageSlug: nextProps.selected,
			} );
		}

		if ( nextProps.languages !== this.props.languages ) {
			this.setState( {
				suggestedLanguages: this.getSuggestedLanguages(),
			} );
		}

		if ( this.state.showingDefaultFilter && nextProps.countryCode !== this.props.countryCode ) {
			this.setState( {
				filter: getLanguageGroupByCountryCode( nextProps.countryCode ),
			} );
		}
	}

	getLocalizedLanguageTitle( languageSlug ) {
		const { localizedLanguageNames } = this.props;
		return localizedLanguageNames?.[ languageSlug ]?.localized ?? languageSlug;
	}

	getEnglishLanguageTitle( languageSlug ) {
		const { localizedLanguageNames } = this.props;
		return localizedLanguageNames?.[ languageSlug ]?.en ?? languageSlug;
	}

	getFilterLabel( filter ) {
		const { translate } = this.props;

		const languageGroup = getLanguageGroupById( filter );
		if ( ! languageGroup ) {
			return undefined;
		}
		// `languageGroup.name` is a lambda that takes the `translate` function
		return languageGroup.name( translate );
	}

	getLanguageSearchableFields( language ) {
		// We are getting the fields that will be used for language searching.
		// For example, German will return:
		// 1. language autonym (e.g., Deutsch)
		// 2. language code (de).
		// 3. localized name (e.g., Tedesco) or
		// 4. English name (German).
		return [
			deburr( language.name ).toLowerCase(),
			language.langSlug.toLowerCase(),
			deburr( this.getLocalizedLanguageTitle( language.langSlug ) ).toLowerCase(),
			this.getEnglishLanguageTitle( language.langSlug ).toLowerCase(),
		];
	}

	getFilteredLanguages() {
		const { languages } = this.props;
		const { search, filter } = this.state;

		if ( search ) {
			const searchString = deburr( search ).toLowerCase();
			return languages.filter( ( language ) => {
				const names = this.getLanguageSearchableFields( language );
				return some( names, ( name ) => includes( name, searchString ) );
			} );
		}

		if ( filter ) {
			switch ( filter ) {
				case 'popular':
					return languages
						.filter( ( language ) => language.popular )
						.sort( ( a, b ) => a.popular - b.popular );
				default: {
					const languageGroup = getLanguageGroupById( filter );
					const subTerritories = languageGroup ? languageGroup.subTerritories : null;
					return languages
						.filter( ( language ) =>
							some( language.territories, ( t ) => includes( subTerritories, t ) )
						)
						.sort( ( a, b ) => a.name.localeCompare( b.name ) );
				}
			}
		}

		// By default, show all languages
		return Boolean;
	}

	getSuggestedLanguages() {
		if ( ! ( typeof window.navigator === 'object' && 'languages' in window.navigator ) ) {
			return null;
		}

		const { languages, currentUserLocale } = this.props;
		const suggestedLanguages = [];

		for ( const langSlug of window.navigator.languages ) {
			// Find the language first by its full code (e.g. en-US), and when it fails
			// try only the base code (en). Don't add duplicates.
			const lcLangSlug = langSlug.toLowerCase();
			let language = find( languages, ( lang ) => lang.langSlug === lcLangSlug );

			if ( ! language ) {
				language = find( languages, ( lang ) => startsWith( lcLangSlug, lang.langSlug + '-' ) );
			}

			if (
				language &&
				currentUserLocale !== language.langSlug &&
				! includes( suggestedLanguages, language )
			) {
				suggestedLanguages.push( language );
			}
		}

		return suggestedLanguages;
	}

	getLanguagesListColumnsCount() {
		const wrapper = this.languagesList.current;
		const wrapperWidth = wrapper.getBoundingClientRect().width;
		const wrapperChildWidth =
			wrapper.children.length > 0 ? wrapper.children[ 0 ].getBoundingClientRect().width : 0;

		if ( wrapperChildWidth === 0 ) {
			return 0;
		}

		return Math.floor( wrapperWidth / wrapperChildWidth );
	}

	getShouldRenderNoticeForIncompleteLocale( langSlug ) {
		return ! isDefaultLocale( langSlug ) && isTranslatedIncompletely( langSlug );
	}

	getIncompleteLocaleNoticeMessage( langSlug ) {
		const { translate, getIncompleteLocaleNoticeMessage } = this.props;
		const language = getLanguage( langSlug );

		if ( typeof getIncompleteLocaleNoticeMessage === 'function' ) {
			return getIncompleteLocaleNoticeMessage( language );
		}

		return translate(
			'%(language)s is only %(percentTranslated)d%% translated :(. You can help translate WordPress.com into your language. {{a}}Learn more.{{/a}}',
			{
				components: {
					a: <a href="https://translate.wordpress.com/faq/" />,
				},
				args: {
					language: language.name,
					percentTranslated: language.calypsoPercentTranslated,
				},
			}
		);
	}

	selectLanguageFromSearch( search ) {
		const filteredLanguages = this.getFilteredLanguages();
		const exactMatch = filteredLanguages.find( ( { langSlug } ) => langSlug === search );

		if ( exactMatch ) {
			this.setState( { selectedLanguageSlug: exactMatch.langSlug } );
			return;
		}

		const closeMatch = filteredLanguages.reduce( ( currentCloseMatch, language ) => {
			// If current match is already matching the beginning of a language name,
			// we can skip next steps of matching
			if ( currentCloseMatch && currentCloseMatch.matchIndex === 0 ) {
				return currentCloseMatch;
			}

			const languageNames = this.getLanguageSearchableFields( language );
			const searchString = deburr( search ).toLowerCase();
			const matchIndex = languageNames.reduce( ( currentMatchIndex, languageName ) => {
				const languageNameMatchIndex = languageName.indexOf( searchString );
				return languageNameMatchIndex > -1
					? Math.max( currentMatchIndex, languageNameMatchIndex )
					: currentMatchIndex;
			}, -1 );

			if ( matchIndex === -1 ) {
				return currentCloseMatch;
			}

			if ( ! currentCloseMatch || currentCloseMatch.matchIndex > matchIndex ) {
				return { language, matchIndex };
			}

			return currentCloseMatch;
		}, null );

		if ( closeMatch ) {
			this.setState( { selectedLanguageSlug: closeMatch.language.langSlug } );
		}
	}

	navigateByArrowKey( arrowKey ) {
		const { selectedLanguageSlug } = this.state;
		const filteredLanguages = this.getFilteredLanguages();
		const selectedIndex = filteredLanguages.findIndex(
			( { langSlug } ) => langSlug === selectedLanguageSlug
		);

		let navigateStep = 0;

		if ( arrowKey === 'ArrowUp' ) {
			navigateStep = -this.getLanguagesListColumnsCount();
		} else if ( arrowKey === 'ArrowDown' ) {
			// If selected language is not included in the filtered languages list
			// arrow down key should select first item in the first column
			navigateStep = selectedIndex === -1 ? 1 : this.getLanguagesListColumnsCount();
		} else if ( arrowKey === 'ArrowLeft' ) {
			navigateStep = -1;
		} else if ( arrowKey === 'ArrowRight' ) {
			navigateStep = 1;
		}

		if ( navigateStep === 0 ) {
			return;
		}

		const nextIndex = selectedIndex + navigateStep;

		if ( nextIndex < 0 || nextIndex >= filteredLanguages.length ) {
			return;
		}

		this.setState( { selectedLanguageSlug: filteredLanguages[ nextIndex ].langSlug }, () => {
			if ( this.selectedLanguageItem.current ) {
				this.selectedLanguageItem.current.focus();
			}
		} );
	}

	handleKeyDown = ( event ) => {
		const { isSearchOpen } = this.state;

		// A key press of a printable character should only have a single character
		const isPrintableCharacter = event.key && event.key.length === 1;

		// Prevent search expand with space key as it's used for language select
		if ( event.key === ' ' && ! isSearchOpen ) {
			return;
		}

		// Handle enter key language selection
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			this.handleSelectLanguage();
			return;
		}

		const hasModifierKey = event.altKey || event.ctrlKey || event.metaKey;

		// Handle character input
		if ( ! hasModifierKey && isPrintableCharacter && ! isSearchOpen ) {
			event.preventDefault();

			this.handleSearch( event.key );
			this.handleSearchOpen();

			return;
		}

		// Handle arrow keys navigation
		const arrowKeys = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ];

		if ( arrowKeys.includes( event.key ) ) {
			event.preventDefault();
			this.navigateByArrowKey( event.key );
		}
	};

	handleSearch = ( search ) => {
		this.setState( { search }, () => {
			if ( search ) {
				this.selectLanguageFromSearch( search );
			}
		} );
	};

	handleSearchOpen = () => {
		this.setState( { isSearchOpen: true } );
	};

	handleSearchClose = () => {
		this.setState( { isSearchOpen: false } );
	};

	handleLanguageItemClick = ( selectedLanguageSlug, event ) => {
		event.preventDefault();
		this.setState( { selectedLanguageSlug } );
	};

	handleLanguageItemKeyPress = ( selectedLanguageSlug, event ) => {
		event.preventDefault();
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			this.setState( { selectedLanguageSlug } );
		}
	};

	handleEmpathyModeToggle = ( event ) => {
		this.setState( { empathyMode: event.target.checked } );
	};

	handleUseFallbackForIncompleteLanguages = ( event ) => {
		this.setState( { useFallbackForIncompleteLanguages: event.target.checked } );
	};

	handleSelectLanguage = () => {
		const { empathyMode, selectedLanguageSlug, useFallbackForIncompleteLanguages } = this.state;
		const langSlug = selectedLanguageSlug;
		this.props.onSelected( langSlug, { empathyMode, useFallbackForIncompleteLanguages } );
		this.handleClose();
	};

	recordLanguagePickerEvent = ( isClosingWithoutSelection ) => {
		this.props.recordTracksEvent( 'calypso_languagepicker_closed', {
			searched: false !== this.state.search,
			is_closing_without_selection: isClosingWithoutSelection,
			did_select_language: this.initiallySelectedLanguageSlug !== this.state.selectedLanguageSlug,
		} );
	};

	handleClose = ( isClosingWithoutSelection = false ) => {
		this.recordLanguagePickerEvent( isClosingWithoutSelection );
		this.props.onClose();
	};

	renderTabItems() {
		return map( LANGUAGE_GROUPS, ( languageGroup ) => {
			const filter = languageGroup.id;
			const selected = this.state.filter === filter;

			const onClick = () =>
				this.setState( {
					filter,
					showingDefaultFilter: filter === DEFAULT_LANGUAGE_GROUP,
				} );

			return (
				<SectionNavTabItem key={ filter } selected={ selected } onClick={ onClick }>
					{ this.getFilterLabel( filter ) }
				</SectionNavTabItem>
			);
		} );
	}

	renderLanguageList() {
		const languages = this.getFilteredLanguages();

		return (
			<div className="language-picker__modal-list" ref={ this.languagesList }>
				{ map( languages, this.renderLanguageItem ) }
			</div>
		);
	}

	renderLanguageItem = ( language ) => {
		const isSelected = language.langSlug === this.state.selectedLanguageSlug;
		const classes = classNames( 'language-picker__modal-text', {
			'is-selected': isSelected,
		} );
		const titleText = capitalize( this.getLocalizedLanguageTitle( language.langSlug ) );
		return (
			<div
				ref={ isSelected && this.selectedLanguageItem }
				className="language-picker__modal-item"
				key={ language.langSlug }
				onClick={ partial( this.handleLanguageItemClick, language.langSlug ) }
				title={ titleText }
				tabIndex="0"
				role="button"
				onKeyPress={ partial( this.handleLanguageItemKeyPress, language.langSlug ) }
			>
				<span className={ classes } lang={ language.langSlug }>
					{ language.name }

					{ this.getShouldRenderNoticeForIncompleteLocale( language.langSlug ) && (
						<LanguagePickerItemTooltip langSlug={ language.langSlug }>
							{ this.getIncompleteLocaleNoticeMessage( language.langSlug ) }
						</LanguagePickerItemTooltip>
					) }
				</span>
			</div>
		);
	};

	renderSuggestedLanguages() {
		const { suggestedLanguages } = this.state;

		if ( isEmpty( suggestedLanguages ) ) {
			return null;
		}

		return (
			<div className="language-picker__modal-suggested">
				<div className="language-picker__modal-suggested-inner">
					<div className="language-picker__modal-suggested-label">
						{ this.props.translate( 'Suggested languages:' ) }
					</div>
					<div className="language-picker__modal-suggested-list">
						<div className="language-picker__modal-suggested-list-inner">
							{ map( suggestedLanguages, this.renderLanguageItem ) }
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderEmpathyModeCheckbox() {
		const { showEmpathyModeControl } = this.props;

		if ( ! showEmpathyModeControl ) {
			return null;
		}

		const { empathyMode, selectedLanguageSlug } = this.state;
		const isDefaultLanguageSelected = i18n.defaultLocaleSlug === selectedLanguageSlug;

		return (
			<div className="language-picker__modal-empathy-mode">
				<FormLabel>
					<FormCheckbox
						checked={ empathyMode && ! isDefaultLanguageSelected }
						disabled={ isDefaultLanguageSelected }
						onChange={ this.handleEmpathyModeToggle }
					/>
					<span title="Pretend to use that language but display English where a translated exists">
						Empathy mode
					</span>
				</FormLabel>
			</div>
		);
	}

	renderIncompleteLocaleNotice() {
		const { selectedLanguageSlug, useFallbackForIncompleteLanguages } = this.state;

		if ( ! this.getShouldRenderNoticeForIncompleteLocale( selectedLanguageSlug ) ) {
			return null;
		}

		return (
			<div className="language-picker__modal-locale-notice">
				{ ! this.props.getIncompleteLocaleNoticeMessage && (
					<FormLabel>
						<FormCheckbox
							checked={ useFallbackForIncompleteLanguages }
							onChange={ this.handleUseFallbackForIncompleteLanguages }
						/>
						<span>{ this.props.translate( 'Display interface in English' ) }</span>
					</FormLabel>
				) }

				<p className="language-picker__modal-locale-explanation form-setting-explanation">
					{ this.getIncompleteLocaleNoticeMessage( selectedLanguageSlug ) }
				</p>
			</div>
		);
	}

	render() {
		const { isVisible, translate } = this.props;
		const { filter, search, isSearchOpen } = this.state;

		if ( ! isVisible ) {
			return null;
		}

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'confirm',
				label: translate( 'Select Language' ),
				isPrimary: true,
				onClick: this.handleSelectLanguage,
			},
		];

		return (
			<Dialog
				isVisible
				buttons={ buttons }
				onClose={ () => this.handleClose( true ) }
				additionalClassNames="language-picker__modal"
			>
				<QueryLanguageNames />
				<SectionNav selectedText={ this.getFilterLabel( filter ) }>
					<SectionNavTabs>{ this.renderTabItems() }</SectionNavTabs>
					<Search
						pinned
						fitsContainer
						value={ search || '' }
						isOpen={ isSearchOpen }
						onSearch={ this.handleSearch }
						onSearchOpen={ this.handleSearchOpen }
						onSearchClose={ this.handleSearchClose }
						placeholder={ translate( 'Search languages…' ) }
					/>
				</SectionNav>
				{ this.renderLanguageList() }
				{ this.renderSuggestedLanguages() }
				{ this.renderEmpathyModeCheckbox() }
				{ this.renderIncompleteLocaleNotice() }
			</Dialog>
		);
	}
}

export default connect(
	( state ) => ( {
		countryCode: requestGeoLocation().data || '',
		localizedLanguageNames: getLocalizedLanguageNames( state ),
		currentUserLocale: getCurrentUserLocale( state ),
	} ),
	{ recordTracksEvent }
)( localize( LanguagePickerModal ) );
