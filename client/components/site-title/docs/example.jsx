/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SiteTitleControl from '../';

export default class extends React.PureComponent {
	static displayName = 'SiteTitleControl';

	state = {
		blogname: '',
		blogdescription: '',
	};

	handleChange = ( { blogname, blogdescription } ) => {
		this.setState( { blogname, blogdescription } );
	};

	render() {
		return (
			<SiteTitleControl
				blogname={ this.state.blogname }
				blogdescription={ this.state.blogdescription }
				onChange={ this.handleChange }
			/>
		);
	}
}
