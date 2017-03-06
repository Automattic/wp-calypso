/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import VideoEditor from '../';

class VideoEditorExample extends Component {
	constructor() {
		super();

		this.state = {
			media: {
				videopress_guid: 'vLAM7Mk6'
			}
		};
	}

	handleUpdatePoster = ( { poster } ) => {
		this.setState( { poster } );
	}

	render() {
		return (
			<div>
				<div style={ { height: '50vh' } }>
					<VideoEditor
						media={ this.state.media }
						onUpdatePoster={ this.handleUpdatePoster }
					/>
					<div style={ { 'font-size': '10px', 'text-align': 'center' } }>
						Free B-Roll provided by <a href="http://Videezy.com">Videezy.com</a>
					</div>
				</div>

				<div style={ {
					textAlign: 'center',
					margin: '20px auto 0',
					width: '50%'
				} }>
					<h4>Changes to the poster above are shown below</h4>
					{ this.state.poster &&
						<img src={ this.state.poster } />
					}
				</div>
			</div>
		);
	}
}

VideoEditorExample.displayName = 'VideoEditor';

export default VideoEditorExample;
