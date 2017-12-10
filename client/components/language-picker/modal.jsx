/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import {
	capitalize,
	deburr,
	find,
	get,
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
import Dialog from 'components/dialog';
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import Search from 'components/search';
import { requestLanguageNames } from 'state/i18n/language-names/actions';
import { getLocalizedLanguageNames } from 'state/selectors';
import config from 'config';

export class LanguagePickerModal extends PureComponent {
	static propTypes = {
		onSelected: PropTypes.func,
		onClose: PropTypes.func,
		localizedLanguageNames: PropTypes.object,
		isVisible: PropTypes.bool,
		languages: PropTypes.array.isRequired,
		selected: PropTypes.string,
	};

	static defaultProps = {
		onSelected: noop,
		onClose: noop,
		localizedLanguageNames: {},
		isVisible: false,
		selected: 'en',
	};

	constructor( props ) {
		super( props );

		this.state = {
			filter: 'popular',
			search: false,
			selectedLanguageSlug: this.props.selected,
			suggestedLanguages: this.getSuggestedLanguages(),
		};
	}

	componentWillMount() {
		const { localizedLanguageNames, loadLanguageNames } = this.props;
		if ( config.isEnabled( 'i18n/language-names' ) && isEmpty( localizedLanguageNames ) ) {
			loadLanguageNames();
		}
	}

	componentWillReceiveProps( nextProps ) {
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
	}

	getLocalizedLanguageTitle( languageSlug ) {
		const { localizedLanguageNames } = this.props;
		return get( localizedLanguageNames[ languageSlug ], 'localized' ) || languageSlug;
	}

	getEnglishLanguageTitle( languageSlug ) {
		const { localizedLanguageNames } = this.props;
		return get( localizedLanguageNames[ languageSlug ], 'en' ) || languageSlug;
	}

	getFilterLabel( filter ) {
		const { translate } = this.props;

		switch ( filter ) {
			case 'popular':
				return translate( 'Popular languages', { textOnly: true } );
			default:
				return translate( 'All languages', { textOnly: true } );
		}
	}

	getDisplayedLanguages() {
		const { languages } = this.props;
		const { search, filter } = this.state;

		if ( search ) {
			const searchString = deburr( search ).toLowerCase();
			return languages.filter( language => {
				// Assuming set language is Italian and we're searching for German,
				// we search against:
				// 1. language autonym (e.g., Deutsch)
				// 2. language code (de).
				// 3. localized name (e.g., Tedesco) or
				// 4. English name (German).
				const names = [
					deburr( language.name ).toLowerCase(),
					language.langSlug.toLowerCase(),
					deburr( this.getLocalizedLanguageTitle( language.langSlug ) ).toLowerCase(),
					this.getEnglishLanguageTitle( language.langSlug ).toLowerCase(),
				];
				return some( names, name => includes( name, searchString ) );
			} );
		}

		switch ( filter ) {
			case 'popular':
				const popularLanguages = languages.filter( language => language.popular );
				popularLanguages.sort( ( a, b ) => a.popular - b.popular );
				return popularLanguages;
			default:
				return languages;
		}
	}

	getSuggestedLanguages() {
		if ( ! ( typeof navigator === 'object' && 'languages' in navigator ) ) {
			return null;
		}

		const { languages } = this.props;
		const suggestedLanguages = [];

		for ( const langSlug of navigator.languages ) {
			// Find the language first by its full code (e.g. en-US), and when it fails
			// try only the base code (en). Don't add duplicates.
			const lcLangSlug = langSlug.toLowerCase();
			let language = find( languages, lang => lang.langSlug === lcLangSlug );

			if ( ! language ) {
				language = find( languages, lang => startsWith( lcLangSlug, lang.langSlug + '-' ) );
			}
			if ( language && ! includes( suggestedLanguages, language ) ) {
				suggestedLanguages.push( language );
			}
		}

		return suggestedLanguages;
	}

	handleSearch = search => {
		this.setState( { search } );
	};

	handleClick = selectedLanguageSlug => {
		this.setState( { selectedLanguageSlug } );
	};

	handleSelectLanguage = () => {
		const langSlug = this.state.selectedLanguageSlug;
		this.props.onSelected( langSlug );
		this.handleClose();
	};

	handleClose = () => {
		this.props.onClose();
	};

	renderTabItems() {
		const tabs = [ 'popular', '' ];

		return map( tabs, filter => {
			const selected = this.state.filter === filter;
			const onClick = () => this.setState( { filter } );

			return (
				<SectionNavTabItem key={ filter } selected={ selected } onClick={ onClick }>
					{ this.getFilterLabel( filter ) }
				</SectionNavTabItem>
			);
		} );
	}

	renderLanguageList() {
		const languages = this.getDisplayedLanguages();

		return (
			<div className="language-picker__modal-list">
				{ map( languages, this.renderLanguageItem ) }
			</div>
		);
	}

	renderLanguageItem = language => {
		const isSelected = language.langSlug === this.state.selectedLanguageSlug;
		const classes = classNames( 'language-picker__modal-text', {
			'is-selected': isSelected,
		} );

		return (
			<div
				className="language-picker__modal-item"
				key={ language.langSlug }
				onClick={ partial( this.handleClick, language.langSlug ) }
				title={ capitalize( this.getLocalizedLanguageTitle( language.langSlug ) ) }
			>
				<span className={ classes }>{ language.name }</span>
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

	render() {
		const { isVisible, translate } = this.props;
		const { filter } = this.state;

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
				onClose={ this.handleClose }
				additionalClassNames="language-picker__modal"
			>
				<SectionNav selectedText={ this.getFilterLabel( filter ) }>
					<SectionNavTabs>{ this.renderTabItems() }</SectionNavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ this.handleSearch }
						placeholder={ translate( 'Search languages…' ) }
					/>
				</SectionNav>
				{ this.renderLanguageList() }
				{ this.renderSuggestedLanguages() }
			</Dialog>
		);
	}
}

export default connect(
	state => {
		return {
			localizedLanguageNames: getLocalizedLanguageNames( state ),
		};
	},
	{ loadLanguageNames: requestLanguageNames }
)( localize( LanguagePickerModal ) );
