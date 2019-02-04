/** @format */

/**
 * External dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getVideoPressUrl, isVideoPressUrl } from './utils';

const withVideoPressEdit = createHigherOrderComponent( CoreVideoEdit => {
	return class VideoPressEdit extends Component {
		componentDidMount() {
			this.setSrcFromVideoPress();
		}

		componentDidUpdate( prevProps ) {
			if ( this.props.attributes.id !== prevProps.attributes.id ) {
				this.setSrcFromVideoPress();
			}
		}

		setSrcFromVideoPress = async () => {
			const { id, src } = this.props.attributes;

			if ( ! id || isVideoPressUrl( src ) ) {
				return;
			}

			const videoPressUrl = await getVideoPressUrl( id );

			if ( ! videoPressUrl ) {
				// No VideoPress data found for given video id
				return;
			}

			const { id: currentId } = this.props.attributes;
			if ( id && id !== currentId ) {
				// Video was changed in the editor while fetching data for the previous video;
				return;
			}

			this.props.setAttributes( {
				src: videoPressUrl,
			} );
		};

		render() {
			return <CoreVideoEdit { ...this.props } />;
		}
	};
}, 'withVideoPressEdit' );

export default withVideoPressEdit;
