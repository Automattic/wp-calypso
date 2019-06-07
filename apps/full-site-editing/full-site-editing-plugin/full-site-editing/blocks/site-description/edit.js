/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { PlainText } from '@wordpress/editor';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */

class SiteDescriptionEdit extends Component {
	state = {
		description: null,
	};

	componentDidMount() {
		apiFetch( { path: '/wp/v2/settings' } ).then( ( { description } ) => {
			this.setState( { description: description } );
		} );
	}

	render() {
		const { isSelected } = this.props;
		if ( isSelected ) {
			return (
				<PlainText
					className="wp-block-a8c-site-description"
					value={ this.state.description }
					placeholder={ __( 'Site Title…' ) }
					aria-label={ __( 'SiteTitle' ) }
				/>
			);
		}
		return <p className="site-description">{ this.state.title }</p>;
	}
}

export default SiteDescriptionEdit;
