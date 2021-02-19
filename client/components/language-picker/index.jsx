/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, isString, noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import LanguagePickerModal from './modal';
import { getLanguageCodeLabels } from './utils';

/**
 * Style dependencies
 */
import './style.scss';

export class LanguagePicker extends PureComponent {
	static propTypes = {
		languages: PropTypes.array.isRequired,
		valueKey: PropTypes.string,
		value: PropTypes.any,
		onChange: PropTypes.func,
		onClick: PropTypes.func,
		showEmpathyModeControl: PropTypes.bool,
		empathyMode: PropTypes.bool,
		getIncompleteLocaleNoticeMessage: PropTypes.func,
	};

	static defaultProps = {
		languages: [],
		valueKey: 'value',
		onChange: noop,
		onClick: noop,
		showEmpathyModeControl: config.isEnabled( 'i18n/empathy-mode' ),
		empathyMode: false,
		useFallbackForIncompleteLanguages: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			selectedLanguage: this.findLanguage( props.valueKey, props.value ),
			empathyMode: props.empathyMode,
			useFallbackForIncompleteLanguages: props.useFallbackForIncompleteLanguages,
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.value !== this.props.value || nextProps.valueKey !== this.props.valueKey ) {
			this.setState( {
				selectedLanguage: this.findLanguage( nextProps.valueKey, nextProps.value ),
			} );
		}

		if ( nextProps.empathyMode !== this.props.empathyMode ) {
			this.setState( {
				empathyMode: nextProps.empathyMode,
			} );
		}

		if (
			nextProps.useFallbackForIncompleteLanguages !== this.props.useFallbackForIncompleteLanguages
		) {
			this.setState( {
				useFallbackForIncompleteLanguages: nextProps.useFallbackForIncompleteLanguages,
			} );
		}
	}

	findLanguage( valueKey, value ) {
		const { translate } = this.props;
		//check if the language provided is supported by Calypso
		const language = find( this.props.languages, ( lang ) => {
			// The value passed is sometimes string instead of number - need to use ==
			return lang[ valueKey ] == value; // eslint-disable-line eqeqeq
		} );
		//if an unsupported language is provided return it without a display name
		if ( isString( value ) && ! language ) {
			return {
				langSlug: value,
				name: translate( 'Unsupported language' ),
			};
		}
		//else return either the supported language or undefined (loading state)
		return language;
	}

	handleSelectLanguage = ( language, { empathyMode, useFallbackForIncompleteLanguages } ) => {
		// onChange takes an object in shape of a DOM event as argument
		const value = language[ this.props.valueKey ] || language.langSlug;
		const event = { target: { value, empathyMode, useFallbackForIncompleteLanguages } };
		this.props.onChange( event );
		this.setState( {
			selectedLanguage: language,
			empathyMode,
			useFallbackForIncompleteLanguages,
		} );
	};

	toggleOpen() {
		this.setState( { open: ! this.state.open } );
	}

	handleClick = ( event ) => {
		if ( ! this.props.disabled ) {
			this.props.onClick( event );
			this.toggleOpen();
		}
	};

	handleClose = () => this.setState( { open: false } );

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

	renderModal( selectedLanguageSlug ) {
		if ( ! this.state.open ) {
			return null;
		}

		const { languages, showEmpathyModeControl, getIncompleteLocaleNoticeMessage } = this.props;

		return (
			<LanguagePickerModal
				languages={ languages }
				onClose={ this.handleClose }
				onSelectLanguage={ this.handleSelectLanguage }
				selectedLanguageSlug={ selectedLanguageSlug }
				showEmpathyModeControl={ showEmpathyModeControl }
				empathyMode={ this.state.empathyMode }
				useFallbackForIncompleteLanguages={ this.state.useFallbackForIncompleteLanguages }
				getIncompleteLocaleNoticeMessage={ getIncompleteLocaleNoticeMessage }
			/>
		);
	}

	render() {
		const language = this.state.selectedLanguage;
		if ( ! language ) {
			return this.renderPlaceholder();
		}

		const { disabled } = this.props;
		const langName = language.name;
		const { langCode, langSubcode } = getLanguageCodeLabels( language.langSlug );

		return (
			<Fragment>
				<button
					type="button"
					className="language-picker"
					onClick={ this.handleClick }
					disabled={ disabled }
				>
					<div className="language-picker__icon">
						<div className="language-picker__icon-inner">
							{ langSubcode ? `${ langCode } ${ langSubcode }` : langCode }
						</div>
					</div>
					<div className="language-picker__name">
						<div className="language-picker__name-inner">
							<div className="language-picker__name-label">{ langName }</div>
						</div>
					</div>
				</button>
				{ this.renderModal( language.langSlug ) }
			</Fragment>
		);
	}
}

export default localize( LanguagePicker );
