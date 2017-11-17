/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { setPreviewType } from 'state/ui/preview/actions';

class NativeCustomizer extends React.Component {
	static propTypes = {
		setPreviewType: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
	};

	componentWillMount() {
		this.props.setPreviewType( 'design-preview' );
		this.props.setLayoutFocus( 'preview-sidebar' );
	}

	componentWillUnmount() {
		this.props.setLayoutFocus( 'content' );
	}

	render() {
		return <div className="paladin__native-customizer" />;
	}
}

export default connect( null, { setLayoutFocus, setPreviewType } )( NativeCustomizer );
