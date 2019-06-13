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
	};

	componentDidMount() {
		const { setAttributes } = this.props;
		try {
			apiFetch( { path: '/wp/v2/settings' } ).then( ( { description } ) => {
				this.setState( {
					fromApi: description,
				} );
				setAttributes( { description } );
			} );
		} catch ( error ) {
			this.handleApiError();
		}
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.isSaving === false &&
			this.props.isSaving === true &&
			this.state.fromApi !== this.state.value
		) {
			try {
				apiFetch( {
					path: '/wp/v2/settings',
					method: 'POST',
					data: {
						description: this.state.value,
					},
				} );
			} catch ( error ) {
				this.handleApiError( true );
			}
		}
	}

	handleApiError( post = false ) {
		if ( post ) {
			this.props.setAttributes( {
				description: this.state.fromApi,
			} );
		}
		// trigger notice
	}

	render() {
		const { attributes: { description }, isSelected, setAttributes } = this.props;
		if ( isSelected ) {
			return (
				<PlainText
					className="wp-block-a8c-site-description"
					value={ description }
					onChange={ value => setAttributes( { description: value } ) }
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
