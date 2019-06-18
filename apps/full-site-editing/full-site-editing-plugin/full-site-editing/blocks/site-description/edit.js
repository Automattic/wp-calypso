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
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */

class SiteDescriptionEdit extends Component {
	state = {
		fromApi: null,
		description: __( 'Site description loading…' ),
	};

	componentDidMount() {
		try {
			apiFetch( { path: '/wp/v2/settings' } ).then( ( { description } ) => {
				this.setState( {
					fromApi: description,
					description,
				} );
			} );
		} catch ( error ) {
			this.handleApiError();
		}
	}

	componentDidUpdate( prevProps ) {
		const { description, fromApi } = this.state;
		if ( ! prevProps.isSaving && this.props.isSaving && fromApi !== description ) {
			try {
				apiFetch( {
					path: '/wp/v2/settings',
					method: 'POST',
					data: { description },
				} );
			} catch ( error ) {
				this.handleApiError( true );
			}
		}
	}

	handleApiError( post = false ) {
		if ( post ) {
			this.setState( {
				description: this.state.fromApi,
			} );
		}
		// trigger notice
	}

	render() {
		const { isSelected } = this.props;
		const { description } = this.state;
		if ( isSelected ) {
			return (
				<PlainText
					className="wp-block-a8c-site-description"
					value={ description }
					onChange={ value => this.setState( { description: value } ) }
					placeholder={ __( 'Site Description' ) }
					aria-label={ __( 'Site Description' ) }
				/>
			);
		}
		return <p className="site-description">{ description }</p>;
	}
}

export default compose( [
	withSelect( select => {
		const { isSavingPost } = select( 'core/editor' );
		return {
			isSaving: isSavingPost(),
		};
	} ),
] )( SiteDescriptionEdit );
