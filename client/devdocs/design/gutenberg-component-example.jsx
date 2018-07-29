/** @format */

/**
 * External dependencies
 */
import React from 'react';
import * as components from '@wordpress/components';
import { withState } from '@wordpress/compose';
import { getSettings } from '@wordpress/date';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import request from 'superagent';
import codeBlocks from 'gfm-code-blocks';
import classnames from 'classnames';

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
				let code = codeBlocks( text ).filter( block => 'jsx' === block.lang )[ 0 ].code;

				// react-live cannot resolve imports in real time, so we get rid of them
				// (dependencies will be injected via the scope property)
				code = code.replace( /^.*import.*$/gm, '' );

				this.setState( { code } );
			} );
	}

	render() {
		const { code } = this.state;
		const scope = {
			...components,
			withState,
			getSettings,
		};
		const className = classnames(
			'design__gutenberg-component-example',
			`design__gutenberg-component-example--${ this.props.readmeFilePath }`
		);

		return code ? (
			<LiveProvider code={ code } scope={ scope } className={ className }>
				<LiveError />
				<LivePreview />
			</LiveProvider>
		) : null;
	}
}

export default Example;
