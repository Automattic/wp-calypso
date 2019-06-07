/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import React, { Component } from 'react';
import { __ } from '@wordpress/i18n';
const { withSelect } = wp.data;
const { apiFetch } = wp;

/**
 * Internal dependencies
 */

class SiteTitleEdit extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			title: null,
			initialTitle: null,
		};
	}

	componentDidMount() {
		if ( this.state.initialTitle ) {
			return;
		}

		apiFetch( { path: '/wp/v2/settings' } ).then( ( { title } ) => {
			this.setState( { initialTitle: title } );
		} );
	}

	componentDidUpdate( prevProps ) {
		const { isSaving, isPublished, isPublishing, isAutosaving } = this.props;

		if ( this.isPure() || prevProps.isSaving === this.props.isSaving ) {
			return;
		}

		if ( ( ( isSaving && isPublished ) || isPublishing ) && ! isAutosaving ) {
			const { title } = this.state;

			apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { title } } ).then( () => {
				this.setState( { initialTitle: title } );
			} );

			this.resetTitle();
		}
	}

	setSiteTitle = ( { target: { value } } ) => {
		this.setState( { title: value } );
	};

	resetTitle = () => {
		const { title } = this.state;

		this.setState( { initalTitle: title } );
	};

	isPure = () => {
		const { title, initialTitle } = this.state;

		return title && title.trim() === initialTitle.trim();
	};

	render() {
		const { title, initialTitle } = this.state;

		return (
			<div className="full-site-editing__site_title_block">
				<h1 className="full-site-editing__site_title_field">
					<textarea
						placeholder={ initialTitle }
						onBlur={ this.setSiteTitle }
						defaultValue={ title }
					/>
				</h1>
			</div>
		);
	}
}

export default withSelect( select => {
	const { isSavingPost, isPublishingPost, isAutosavingPost, isCurrentPostPublished } = select(
		'core/editor'
	);
	return {
		isSaving: isSavingPost(),
		isPublishing: isPublishingPost(),
		isAutosaving: isAutosavingPost(),
		isPublished: isCurrentPostPublished(),
	};
} )( SiteTitleEdit );
