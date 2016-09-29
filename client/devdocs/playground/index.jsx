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
import Notice from 'components/notice';

var componentExample = require( "raw!./../../components/notice/docs/example.txt" );


let DesignPlayGround = React.createClass( {
	displayName: 'DesignPlayGround',

	render() {
		return (
			<Main className="design">
				<Playground codeText={ componentExample } theme="material" scope={ { React: React, Button: Button, Notice: Notice } } noRender={ true } />
			</Main>
		);
	}
} );

export default DesignPlayGround;
