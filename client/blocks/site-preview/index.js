/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import designPreview from 'my-sites/design-preview';
import urlPreview from 'blocks/url-preview';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { getCurrentPreviewType } from 'state/ui/preview/selectors';

const DesignPreview = designPreview( WebPreview );
const UrlPreview = urlPreview( WebPreview );

class SitePreview extends Component {
	render() {
		const components = {
			'design-preview': DesignPreview,
			'site-preview': UrlPreview,
		};
		const Preview = components[ this.props.currentPreviewType ] || noop;
		return <Preview showPreview={ this.props.showPreview } />;
	}
}

SitePreview.propTypes = {
	currentPreviewType: PropTypes.string,
	showPreview: PropTypes.bool,
};

SitePreview.defaultProps = {
	currentPreviewType: 'site-preview',
	showPreview: false,
};

const mapStateToProps = state => ( {
	currentPreviewType: getCurrentPreviewType( state ),
	showPreview: getCurrentLayoutFocus( state ) === 'preview',
} );

export default connect( mapStateToProps )( SitePreview );
