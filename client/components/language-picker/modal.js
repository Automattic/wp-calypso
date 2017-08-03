/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { includes, map, noop, partial } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import Search from 'components/search';

class LanguagePickerModal extends PureComponent {
	static propTypes = {
		onSelected: PropTypes.func,
		onClose: PropTypes.func,
	}

	static defaultProps = {
		onSelected: noop,
		onClose: noop,
	}

	constructor( props ) {
		super( props );

		this.state = {
			filter: 'popular',
			search: false,
			selectedLanguageSlug: this.props.selected,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.selected !== this.state.selectedLanguageSlug ) {
			this.setState( {
				selectedLanguageSlug: nextProps.selected
			} );
		}
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
			const searchString = search.toLowerCase();
			return languages.filter( language => {
				return includes( language.name.toLowerCase(), searchString );
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

	handleSearch = ( search ) => {
		this.setState( { search } );
	}

	handleClick = ( selectedLanguageSlug ) => {
		this.setState( { selectedLanguageSlug } );
	}

	handleSelectLanguage = () => {
		const langSlug = this.state.selectedLanguageSlug;
		this.props.onSelected( langSlug );
		this.handleClose();
	}

	handleClose = () => {
		this.props.onClose();
	}

	renderTabItems() {
		const tabs = [ 'popular', '' ];

		return map( tabs, filter => {
			const selected = this.state.filter === filter;
			const onClick = () => this.setState( { filter } );

			return (
				<SectionNavTabItem
					key={ filter }
					selected={ selected }
					onClick={ onClick }
				>
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

	renderLanguageItem = ( language ) => {
		const isSelected = language.langSlug === this.state.selectedLanguageSlug;
		const classes = classNames( 'language-picker__modal-text', {
			'is-selected': isSelected
		} );

		return (
			<div
				className="language-picker__modal-item"
				key={ language.langSlug }
				onClick={ partial( this.handleClick, language.langSlug ) }
			>
				<span className={ classes }>{ language.name }</span>
			</div>
		);
	}

	render() {
		const { isVisible, translate } = this.props;

		if ( ! isVisible ) {
			// Render nothing at all if the modal is not visible
			// <Dialog isVisible={ false }> still renders a lot of useless elements
			return null;
		}

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' )
			},
			{
				action: 'confirm',
				label: translate( 'Select Language' ),
				isPrimary: true,
				onClick: this.handleSelectLanguage
			},
		];

		return (
			<Dialog
				isVisible
				buttons={ buttons }
				onClose={ this.handleClose }
				additionalClassNames="language-picker__modal"
			>
				<SectionNav selectedText={ this.getFilterLabel( this.state.filter ) }>
					<SectionNavTabs>
						{ this.renderTabItems() }
					</SectionNavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ this.handleSearch }
						placeholder={ translate( 'Search languages…' ) }
					/>
				</SectionNav>
				{ this.renderLanguageList() }
			</Dialog>
		);
	}
}

export default localize( LanguagePickerModal );
