/** @format */

/**
 * External dependencies
 */
import React from 'react';
import * as scope from '@wordpress/components';
import { LiveError, LiveProvider, LivePreview } from 'react-live';
import request from 'superagent';
import codeBlocks from 'gfm-code-blocks';

class Example extends React.Component {
	state = {
		code: null,
	};

	componentDidMount() {
		this.getCode();
	}

	getCode() {
		const readmeFilePath = `/node_modules/@wordpress/components/src/${
			this.props.readmeFilePath
		}/README.md`;
		request
			.get( '/devdocs/service/content' )
			.query( {
				path: readmeFilePath,
				format: 'markdown',
			} )
			.then( ( { text } ) => {
				let code = codeBlocks( text )[ 0 ].code;

				// react-live cannot resolve imports in real time, so we get rid of them
				// (dependencies will be injected via the scope property)
				code = code.replace( /^.*import.*$/gm, '' );

				this.setState( { code } );
			} );
	}

	render() {
		const { code } = this.state;
		return code ? (
			<LiveProvider code={ code } scope={ scope } className="design__gutenberg-component-example">
				<LiveError />
				<LivePreview />
			</LiveProvider>
		) : null;
	}
}

export default Example;
