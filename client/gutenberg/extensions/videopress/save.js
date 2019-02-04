/** @format */

/**
 * External dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { RichText } from '@wordpress/editor';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getVideoPressUrlFromGuid } from './util';

const VideoPressSave = CoreVideoSave => ( { attributes } ) => {
	const { caption, guid } = attributes;

	if ( ! guid ) {
		return <CoreVideoSave attributes={ attributes } />;
	}

	const url = getVideoPressUrlFromGuid( guid );
	const embedClassName = classnames( 'wp-block-embed', 'is-type-video', 'is-provider-videopress' );

	return (
		<figure className={ embedClassName }>
			<div className="wp-block-embed__wrapper">
				{ `\n${ url }\n` /* URL needs to be on its own line. */ }
			</div>
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content tagName="figcaption" value={ caption } />
			) }
		</figure>
	);
};

export default createHigherOrderComponent( VideoPressSave, 'withVideoPressSave' );
