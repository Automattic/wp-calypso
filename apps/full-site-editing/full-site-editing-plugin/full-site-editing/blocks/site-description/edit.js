/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */

class SiteDescriptionEdit extends Component {
	state = {
		description: __( 'Site description loading…' ),
	};

	componentDidMount() {
		apiFetch( { path: '/wp/v2/settings' } ).then( ( { description } ) => {
			this.setState( { description } );
		} );
	}

	render() {
		const { isSelected } = this.props;
		if ( isSelected ) {
			return (
				<TextControl
					className="wp-block-a8c-site-description"
					value={ this.state.description }
					onChange={ description => this.setState( { description } ) }
					placeholder={ __( 'Site Description' ) }
					aria-label={ __( 'Site Description' ) }
				/>
			);
		}
		return <p className="site-description">{ this.state.description }</p>;
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isSavingPost,
		} = select( 'core/editor' );
		return {
			isSaving: isSavingPost(),
		};
	} ),
] )( SiteDescriptionEdit );
