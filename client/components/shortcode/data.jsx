/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import { cloneElement, Component } from 'react';
import { Container } from 'flux/utils';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import ShortcodesStore from 'lib/shortcodes/store';

class ShortcodeData extends Component {
	static getStores() {
		return [ ShortcodesStore ];
	}

	static calculateState( prevState, props ) {
		const { siteId, shortcode } = props;

		return {
			data: ShortcodesStore.get( siteId, shortcode )
		};
	}

	render() {
		const { children, filterRenderResult } = this.props;
		const props = pick( this.state.data, 'body', 'scripts', 'styles' );
		return cloneElement( children, filterRenderResult( props ) );
	}
}

ShortcodeData.propTypes = {
	siteId: PropTypes.number.isRequired,
	shortcode: PropTypes.string.isRequired,
	filterRenderResult: PropTypes.func
};

ShortcodeData.defaultProps = {
	filterRenderResult: ( props ) => props
};

export default Container.create( ShortcodeData, { withProps: true } );
