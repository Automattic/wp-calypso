/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, isString, noop } from 'lodash';

/**
 * Internal dependencies
 */
import LanguagePickerModal from './modal';
import { requestGeoLocation } from 'state/data-getters';
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
		countryCode: PropTypes.string,
	};

	static defaultProps = {
		languages: [],
		valueKey: 'value',
		onChange: noop,
		onClick: noop,
		countryCode: '',
	};

	constructor( props ) {
		super( props );

		this.state = {
			selectedLanguage: this.findLanguage( props.valueKey, props.value ),
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.value !== this.props.value || nextProps.valueKey !== this.props.valueKey ) {
			this.setState( {
				selectedLanguage: this.findLanguage( nextProps.valueKey, nextProps.value ),
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

	selectLanguage = ( languageSlug ) => {
		// Find the language by the slug
		const language = this.findLanguage( 'langSlug', languageSlug );
		if ( ! language ) {
			return;
		}

		// onChange takes an object in shape of a DOM event as argument
		const value = language[ this.props.valueKey ] || language.langSlug;
		const event = { target: { value } };
		this.props.onChange( event );
		this.setState( {
			selectedLanguage: language,
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
		const { countryCode, languages } = this.props;
		return (
			<LanguagePickerModal
				isVisible
				languages={ languages }
				onClose={ this.handleClose }
				onSelected={ this.selectLanguage }
				selected={ selectedLanguageSlug }
				countryCode={ countryCode }
			/>
		);
	}

	render() {
		const language = this.state.selectedLanguage;
		if ( ! language ) {
			return this.renderPlaceholder();
		}

		const { disabled, translate } = this.props;
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
							{ langCode }
							{ langSubcode && <br /> }
							{ langSubcode }
						</div>
					</div>
					<div className="language-picker__name">
						<div className="language-picker__name-inner">
							<div className="language-picker__name-label">{ langName }</div>
							<div className="language-picker__name-change">{ translate( 'Change' ) }</div>
						</div>
					</div>
				</button>
				{ this.renderModal( language.langSlug ) }
			</Fragment>
		);
	}
}

export default connect( () => ( { countryCode: requestGeoLocation().data } ) )(
	localize( LanguagePicker )
);
