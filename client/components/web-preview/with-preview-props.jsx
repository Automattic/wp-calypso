/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { setPreviewUrl, setPreviewType } from 'state/ui/preview/actions';
import { setUrlScheme } from 'lib/url';

class WithPreviewProps extends Component {
	static propTypes = {
		url: PropTypes.string.isRequired,
		isPreviewable: PropTypes.bool.isRequired,
		children: PropTypes.func.isRequired,
		dispatch: PropTypes.func.isRequired,
	}

	render() {
		const { children, ...rest } = this.props;
		return children( makeProps( rest ) );
	}
}

function makeProps( { url, isPreviewable, dispatch } ) {
	return isPreviewable
		? { onClick: openWebPreview.bind( null, url, dispatch ) }
		: {
			href: url,
			target: '_blank',
			rel: 'noopener noreferrer',
		};
}

function openWebPreview( url, dispatch ) {
	// Avoid Mixed Content errors by forcing HTTPS, which is a requirement
	// of previewable sites anyway. 10198-gh-wp-calypso
	dispatch( setPreviewUrl( setUrlScheme( url, 'https' ) ) );
	dispatch( setPreviewType( 'site-preview' ) );
	dispatch( setLayoutFocus( 'preview' ) );
}

export default connect()( WithPreviewProps );
