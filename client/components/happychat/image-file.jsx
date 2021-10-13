import { Gridicon } from '@automattic/components';
import { Component, Fragment } from 'react';
// import { recordEvent } from 'src/lib/tracks';
import wpcom from 'calypso/lib/wp';

import './image-file.scss';

class ImageFile extends Component {
	state = {
		imgSrc: null,
	};

	static defaultProps = {
		maxWidth: 200,
		maxHeight: 100,
	};

	loadImage = () => {
		const { session_id: sessionId, id } = this.props.file;

		wpcom.req
			.get( {
				path: `/happychat/sessions/${ sessionId }/files/${ id }`,
				apiNamespace: 'wpcom/v2',
				responseType: 'blob',
			} )
			.then( ( imageBlob ) => {
				this.setState( { imgSrc: URL.createObjectURL( imageBlob ) } );
			} );
	};

	handleClick = () => {
		// recordEvent( 'happychatclient_file_opened', {
		// 	file_type: 'image',
		// 	file_id: this.props.file.id,
		// 	session_id: this.props.file.session_id,
		// } );
	};

	componentDidMount() {
		this.loadImage();
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.file.id !== this.props.file.id ||
			prevProps.file.session_id !== this.props.file.session_id
		) {
			this.loadImage();
		}
	}

	render() {
		const { maxHeight, maxWidth } = this.props;
		const { imgSrc } = this.state;

		return (
			<a
				className="happychat__image-file"
				href={ imgSrc }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.handleClick }
			>
				{ imgSrc ? (
					<Fragment>
						<img
							className="happychat__image-file-thumbnail"
							src={ imgSrc }
							style={ { maxWidth, maxHeight } }
							alt=""
						/>
						<span className="happychat__image-file-hover-prompt">
							<Gridicon icon="external" size={ 18 } />
						</span>
					</Fragment>
				) : (
					<span
						className="happychat__image-file-placeholder"
						style={ { width: maxHeight, height: maxHeight } }
					></span>
				) }
			</a>
		);
	}
}

export default ImageFile;
