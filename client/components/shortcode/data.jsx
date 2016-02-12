/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { Container } from 'flux/utils';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import passToChildren from 'lib/react-pass-to-children';
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
		const props = pick( this.state.data, 'body', 'scripts', 'styles' );
		return passToChildren( this, this.props.filterRenderResult( props ) );
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
