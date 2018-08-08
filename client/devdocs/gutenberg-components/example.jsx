/** @format */

/**
 * External dependencies
 */
import React from 'react';
import * as components from '@wordpress/components';
import { withState } from '@wordpress/compose';
import { getSettings } from '@wordpress/date';
import { addFilter } from '@wordpress/hooks';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import request from 'superagent';
import codeBlocks from 'gfm-code-blocks';
import classnames from 'classnames';
import { kebabCase } from 'lodash';
import PropTypes from 'prop-types';

class Example extends React.Component {
	state = {
		code: null,
	};

	componentDidMount() {
		this.getCode();
	}

	async getReadme() {
		const readmeFilePath = `/node_modules/@wordpress/components/src/${
			this.props.readmeFilePath
		}/README.md`;

		const { text } = await request.get( '/devdocs/service/content' ).query( {
			path: readmeFilePath,
			format: 'markdown',
		} );
		return text;
	}

	async getCode() {
		const readme = await this.getReadme();

		let code = codeBlocks( readme ).find( block => 'jsx' === block.lang ).code;

		// react-live cannot resolve imports in real time, so we get rid of them
		// (dependencies will be injected via the scope property).
		code = code.replace( /^.*import.*$/gm, '' );

		// All the examples are defining a functional component called My<ComponentName> we
		// can render.
		code = `
			${ code }
			render( <${ this.props.render } /> );
		`;

		this.setState( { code } );
	}

	render() {
		const { code } = this.state;
		const scope = {
			...components,
			withState,
			getSettings,
			PropTypes,
			addFilter,
		};
		const className = classnames(
			'devdocs__gutenberg-components__example',
			`devdocs__gutenberg-components__example--${ kebabCase( this.props.component ) }`
		);

		return code ? (
			<LiveProvider code={ code } scope={ scope } className={ className } noInline={ true }>
				<LiveError />
				<LivePreview />
			</LiveProvider>
		) : null;
	}
}

export default Example;
