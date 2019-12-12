/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getLocalizedLanguageNames from 'state/selectors/get-localized-language-names';
import { requestLanguageNames } from 'state/i18n/language-names/actions';

class QueryLanguageNames extends Component {
	static propTypes = {
		languageNames: PropTypes.object,
		requestLanguageNames: PropTypes.func,
	};

	static defaultProps = {
		requestLanguageNames: () => {},
	};

	UNSAFE_componentWillMount() {
		if ( ! this.props.languageNames ) {
			this.props.requestLanguageNames();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		languageNames: getLocalizedLanguageNames( state ),
	} ),
	{ requestLanguageNames }
)( QueryLanguageNames );
