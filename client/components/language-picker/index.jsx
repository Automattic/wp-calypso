/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import LanguagePickerModal from './modal';

class LanguagePicker extends PureComponent {

	static propTypes = {
		languages: PropTypes.array.isRequired,
		valueKey: PropTypes.string,
		value: PropTypes.any,
		onChange: PropTypes.func,
	}

	static defaultProps = {
		languages: [],
		valueKey: 'value',
		onChange: noop,
	}

	constructor( props ) {
		super( props );

		this.state = {
			selectedLanguage: this.findLanguage( props.valueKey, props.value )
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.value !== this.props.value || nextProps.valueKey !== this.props.valueKey ) {
			this.setState( {
				selectedLanguage: this.findLanguage( nextProps.valueKey, nextProps.value )
			} );
		}
	}

	findLanguage( valueKey, value ) {
		return find( this.props.languages, lang => {
			// The value passed is sometimes string instead of number - need to use ==
			return lang[ valueKey ] == value; // eslint-disable-line eqeqeq
		} );
	}

	selectLanguage = ( languageSlug ) => {
		// Find the language by the slug
		const language = this.findLanguage( 'langSlug', languageSlug );
		if ( ! language ) {
			return;
		}

		// onChange takes an object in shape of a DOM event as argument
		const value = language[ this.props.valueKey ];
		const event = { target: { value } };
		this.props.onChange( event );
		this.setState( {
			selectedLanguage: language,
		} );
	}

	toggleOpen = () => {
		if ( ! this.props.disabled ) {
			this.setState( { open: ! this.state.open } );
		}
	}

	handleClose = () => {
		this.setState( { open: false } );
	}

	renderPlaceholder() {
		const classes = classNames( 'language-picker', 'is-loading' );

		return (
			<div className={ classes }>
				<div className="language-picker__icon">
					<div className="language-picker__icon-inner" />
				</div>
				<div className="language-picker__name">
					<div className="language-picker__name-inner" />
				</div>
			</div>
		);
	}

	render() {
		const language = this.state.selectedLanguage;
		if ( ! language ) {
			return this.renderPlaceholder();
		}

		const [ langCode, langSubcode ] = language.langSlug.split( '-' );
		const langName = language.name;
		const { disabled, translate } = this.props;

		return (
			<div className="language-picker" onClick={ this.toggleOpen } disabled={ disabled }>
				<div className="language-picker__icon">
					<div className="language-picker__icon-inner">
						{ langCode }
						{ langSubcode && <br /> }
						{ langSubcode }
					</div>
				</div>
				<div className="language-picker__name">
					<div className="language-picker__name-inner">
						<div className="language-picker__name-label">
							{ langName }
						</div>
						<div className="language-picker__name-change" >
							{ translate( 'Change' ) }
						</div>
					</div>
				</div>
				<LanguagePickerModal
					isVisible={ this.state.open }
					languages={ this.props.languages }
					onClose={ this.handleClose }
					onSelected={ this.selectLanguage }
					selected={ language.langSlug }
				/>
			</div>
		);
	}
}

export default localize( LanguagePicker );
