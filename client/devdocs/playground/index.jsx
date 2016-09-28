/**
 * External dependencies
 */
import React from 'react';
import Playground from 'component-playground';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Button from 'components/button';

let DesignPlayGround = React.createClass( {
	displayName: 'DesignPlayGround',

	render() {
		return (
			<Main className="design">
				<Playground codeText={ "<Button>hello</Button>" } theme="material" scope={ { React: React, Button: Button } } noRender={ true } />
			</Main>
		);
	}
} );

export default DesignPlayGround;
