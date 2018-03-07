/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getGeoCountryShort } from 'state/geo/selectors';
import QueryGeo from 'components/data/query-geo';
import LanguagePickerModal from './modal';
import QueryLanguageNames from 'components/data/query-language-names';

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

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.value !== this.props.value || nextProps.valueKey !== this.props.valueKey ) {
			this.setState( {
				selectedLanguage: this.findLanguage( nextProps.valueKey, nextProps.value ),
			} );
		}
	}

	shouldComponentUpdate( nextProps ) {
		if ( nextProps.disabled === true ) {
			return false;
		}
		return true;
	}

	findLanguage( valueKey, value ) {
		return find( this.props.languages, lang => {
			// The value passed is sometimes string instead of number - need to use ==
			return lang[ valueKey ] == value; // eslint-disable-line eqeqeq
		} );
	}

	selectLanguage = languageSlug => {
		// Find the language by the slug
		const language = this.findLanguage( 'langSlug', languageSlug );
		if ( ! language ) {
			return;
		}
		const value = language[ this.props.valueKey ];
		// onChange takes an object in shape of a DOM event as argument
		const event = { target: { value } };
		this.props.onChange( event );
		this.setState( {
			selectedLanguage: language,
		} );
	};

	toggleOpen() {
		this.setState( { open: ! this.state.open } );
	}

	handleClick = event => {
		if ( ! this.props.disabled ) {
			this.props.onClick( event );
			this.toggleOpen();
		}
	};

	handleKeyPress = event => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
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
		const langName = language.name;
		const { disabled, translate } = this.props;

		// assumes xx-yy_variant abstract this into a function and translate( 'formal' )
		const languageCodes = language.langSlug.split( /[_-]+/ );
		const langCode = languageCodes[ 0 ];
		const langSubcode = languageCodes.indexOf( 'formal' ) > -1 ? null : languageCodes[ 1 ];

		return (
			<div
				tabIndex="0"
				role="button"
				className="language-picker"
				onKeyPress={ this.handleKeyPress }
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
				{ this.renderModal( language.langSlug ) }
				<QueryGeo />
				<QueryLanguageNames />
			</div>
		);
	}
}

export default connect( state => ( {
	countryCode: getGeoCountryShort( state ),
} ) )( localize( LanguagePicker ) );
