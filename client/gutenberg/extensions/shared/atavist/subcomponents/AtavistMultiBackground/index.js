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


export class AtavistMultiBackground extends Component {
	render() {
		const { shimColor, imageURL, shimOpacity } = this.props;
		const shimStyle = { opacity: shimOpacity / 100, 'background-color': shimColor };
		const imageStyle = { backgroundImage: `url(${ imageURL })` };
		return (
			<Fragment>
				<div class="atavist-multi-background">
					<div class="atavist-background-image-with-shim">
						<div class="atavist-image" style={ imageStyle } />
						<div class="atavist-background-image-with-shim-shim" style={ shimStyle } />
					</div>
				</div>
      		</Fragment>
    	);
  	}
}

AtavistMultiBackground.defaultProps = {
	shimColor: '#000',
	imageURL: '',
	shimOpacity: 50
}

export default AtavistMultiBackground;
