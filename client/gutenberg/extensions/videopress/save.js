/**
 * External dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { RichText } from '@wordpress/editor';

const VideoPressSave = CoreVideoSave => props => {
	const { attributes: { caption, guid } = {} } = props;

	if ( ! guid ) {
		/**
		 * We return the element produced by the render so Gutenberg can add the block class when cloning the element.
		 * This is due to the fact that `React.cloneElement` ignores the class name when we clone a component to be
		 * rendered (i.e. `React.cloneElement( <CoreVideoSave { ...props } />, { className: 'wp-block-video' } )`).
		 *
		 * @see https://github.com/WordPress/gutenberg/blob/3f1324b53cc8bb45d08d12d5321d6f88510bed09/packages/blocks/src/api/serializer.js#L78-L96
		 * @see https://github.com/WordPress/gutenberg/blob/c5f9bd88125282a0c35f887cc8d835f065893112/packages/editor/src/hooks/generated-class-name.js#L42
		 * @see https://github.com/Automattic/wp-calypso/pull/30546#issuecomment-463637946
		 */
		return CoreVideoSave( props );
	}

	const url = `https://videopress.com/v/${ guid }`;

	return (
		<figure className="wp-block-embed is-type-video is-provider-videopress">
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
