/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, getEditorNewPostPath } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostTypes, getPostType } from 'state/post-types/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { Button, Dialog } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Constants
 */

/**
 * Post types which can be configured in the Writing Site Settings for a site,
 * regardless of whether the current theme supports it.
 *
 * @type {Array}
 */
const CONFIGURABLE_TYPES = [ 'jetpack-portfolio', 'jetpack-testimonial' ];

function EditorPostTypeUnsupported( {
	translate,
	types,
	type,
	typeObject,
	writePostPath,
	siteSlug,
} ) {
	// Don't display if:
	//  1. Types don't exist (haven't yet been loaded for site)
	//  2. The type value has been unset from the edited post (navigating away)
	//  3. Type object provided (indicates that type indeed exists)
	if ( ! types || ! type || typeObject ) {
		return null;
	}

	const buttons = [
		<Button href={ `/posts/${ siteSlug }` }>{ translate( 'Back to My Sites' ) }</Button>,
	];

	const isConfigurableType = includes( CONFIGURABLE_TYPES, type );
	let helpText;
	if ( isConfigurableType ) {
		// For configurable post types (those supported on WordPress.com,
		// direct user to enable them through their site settings)
		switch ( type ) {
			case 'jetpack-portfolio':
				helpText = translate(
					'Portfolios are not enabled. Open your site settings to activate them.'
				);
				break;

			case 'jetpack-testimonial':
				helpText = translate(
					'Testimonials are not enabled. Open your site settings to activate them.'
				);
				break;
		}

		buttons.push(
			<Button href={ `/settings/writing/${ siteSlug }` } primary>
				{ translate( 'Site Settings' ) }
			</Button>
		);
	} else {
		// In all other cases, the path contains a non-existent and unknown
		// post type, so fall back to a generic error message.
		helpText = translate(
			'To use this post type, please check that your theme and site support it.'
		);

		buttons.push(
			<Button href={ writePostPath } primary>
				{ translate( 'Write a Blog Post' ) }
			</Button>
		);
	}

	return (
		<Dialog isVisible buttons={ buttons } className="editor-post-type-unsupported">
			<h1>{ translate( 'This post type is not supported' ) }</h1>
			<p>{ helpText }</p>
			<p>
				{ translate(
					'For more information, visit our {{supportLink}}support page on custom content types{{/supportLink}}.',
					{
						components: {
							supportLink: <a href="https://wordpress.com/support/custom-post-types/" />,
						},
					}
				) }
			</p>
		</Dialog>
	);
}

EditorPostTypeUnsupported.propTypes = {
	translate: PropTypes.func,
	types: PropTypes.object,
	type: PropTypes.string,
	typeObject: PropTypes.object,
	writePostPath: PropTypes.string,
	siteSlug: PropTypes.string,
};

export default connect( ( state, { type } ) => {
	const siteId = getSelectedSiteId( state );
	const postType = type || getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );

	return {
		type: postType,
		types: getPostTypes( state, siteId ),
		typeObject: getPostType( state, siteId, postType ),
		writePostPath: getEditorNewPostPath( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( EditorPostTypeUnsupported ) );
