import { getLocaleSlug } from 'i18n-calypso';
import startsWith from 'lodash/startsWith';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';
import Notice from 'calypso/components/notice';
import { addLocaleToPath, getLanguage } from 'calypso/lib/i18n-utils';
import { switchLocale } from 'calypso/lib/i18n-utils/switch-locale';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import LocaleSuggestionsListItem from './list-item';

import './style.scss';

export class LocaleSuggestions extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		localeSuggestions: PropTypes.array,
	};

	static defaultProps = {
		locale: '',
		localeSuggestions: [],
	};

	state = {
		dismissed: false,
	};

	componentDidMount() {
		let { locale } = this.props;

		if ( ! locale && typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language ) {
					locale = language.langSlug;
					break;
				}
			}
		}

		this.props.switchLocale( locale );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.locale !== prevProps.locale ) {
			this.props.switchLocale( this.props.locale );
		}
	}

	dismiss = () => this.setState( { dismissed: true } );

	getPathWithLocale = ( locale ) => addLocaleToPath( this.props.path, locale );

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		const { localeSuggestions } = this.props;

		if ( ! localeSuggestions ) {
			return <QueryLocaleSuggestions />;
		}

		const usersOtherLocales = localeSuggestions.filter( function ( locale ) {
			return ! startsWith( getLocaleSlug(), locale.locale );
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		const localeMarkup = usersOtherLocales.map( ( locale ) => {
			return (
				<LocaleSuggestionsListItem
					key={ 'locale-' + locale.locale }
					locale={ locale }
					onLocaleSuggestionClick={ this.dismiss }
					path={ this.getPathWithLocale( locale.locale ) }
				/>
			);
		} );

		return (
			<div className="locale-suggestions">
				<Notice icon="globe" showDismiss={ true } onDismissClick={ this.dismiss }>
					<div className="locale-suggestions__list">{ localeMarkup }</div>
				</Notice>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		localeSuggestions: getLocaleSuggestions( state ),
	} ),
	{ switchLocale }
)( LocaleSuggestions );
