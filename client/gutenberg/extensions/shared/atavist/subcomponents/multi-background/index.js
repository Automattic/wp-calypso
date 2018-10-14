/**
 * Wordpress dependencies
 */

import { Component, Fragment } from '@wordpress/element';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

 import './style.scss';


export class MultiBackground extends Component {

	render() {
		const { shimColor, mediaURL, mediaType, shimOpacity, focalPoint } = this.props;
		const shimStyle = { opacity: shimOpacity / 100, 'background-color': shimColor };
		const left = focalPoint ? focalPoint.x * 100 : 50;
		const top = focalPoint ? focalPoint.y * 100 : 50;
		const imageStyle = {
			backgroundImage: `url(${ mediaURL })`,
			backgroundPosition: `${ left }% ${ top }%` };
		let mediaMarkup;
		if ( mediaType === 'image' ) {
			mediaMarkup =
				<div
					className="atavist-image"
					style={ imageStyle }
				/>;
		} else if ( mediaType === 'video' ) {
			mediaMarkup =
				<video
					autoplay='true'
					loop='true'
					muted='true'
				>
					<source src={ mediaURL } type="video/mp4" />
				</video>;
		}
		return (
			<Fragment>
				<div class="atavist-multi-background">
					<div class="atavist-background-image-with-shim">
						{ mediaMarkup }
						<div class="atavist-background-image-with-shim-shim" style={ shimStyle } />
						}
					</div>
				</div>
			</Fragment>
		);
	}

}

MultiBackground.defaultProps = {
	shimColor: '#000',
	mediaURL: '',
	shimOpacity: 50
}

export default MultiBackground;
