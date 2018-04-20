/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { map, chunk } from 'lodash';
import jsxToString from 'jsx-to-string';

/**
 * Internal dependencies
 */
import ComponentPlayground from 'devdocs/design/component-playground';
import LazyRender from 'react-lazily-render';
import DocsExampleWrapper from 'devdocs/docs-example/wrapper';
import { camelCaseToSlug, getComponentName } from 'devdocs/docs-example/util';
import ReadmeViewer from 'devdocs/docs-example/readme-viewer';
import Placeholder from 'devdocs/devdocs-async-load/placeholder';

const shouldShowInstance = ( example, filter, component ) => {
	const name = getComponentName( example );

	// let's show only one instance
	if ( component ) {
		const slug = camelCaseToSlug( name );
		return component === slug;
	}

	let searchPattern = name;

	if ( example.props.searchKeywords ) {
		searchPattern += ' ' + example.props.searchKeywords;
	}

	return ! filter || searchPattern.toLowerCase().indexOf( filter ) > -1;
};

const Collection = ( {
	children,
	component,
	examplesToMount = 10,
	filter,
	section = 'design',
} ) => {
	let showCounter = 0;
	const summary = [];

	const examples = React.Children.map( children, example => {
		if ( ! example || ! shouldShowInstance( example, filter, component ) ) {
			return null;
		}

		const exampleName = getComponentName( example );
		const exampleLink = `/devdocs/${ section }/${ camelCaseToSlug( exampleName ) }`;

		showCounter++;

		if ( filter ) {
			summary.push(
				<span key={ `instance-link-${ showCounter }` } className="design__instance-link">
					<a href={ exampleLink }>{ exampleName }</a>
				</span>
			);
		}

		if ( example.props.exampleCode ) {
			const code =
				typeof example.props.exampleCode === 'string'
					? example.props.exampleCode
					: jsxToString( example.props.exampleCode );
			return (
				<div>
					<ComponentPlayground
						code={ code }
						name={ exampleName }
						unique={ !! component }
						url={ exampleLink }
						component={ component }
					/>
					{ component && (
						<ReadmeViewer section={ section } readmeFilePath={ example.props.readmeFilePath } />
					) }
				</div>
			);
		}

		return (
			<div>
				<DocsExampleWrapper name={ exampleName } unique={ !! component } url={ exampleLink }>
					{ example }
				</DocsExampleWrapper>
				{ component && (
					<ReadmeViewer section={ section } readmeFilePath={ example.props.readmeFilePath } />
				) }
			</div>
		);
	} );

	return (
		<div className="design__collection">
			{ showCounter > 1 &&
				filter && (
					<div className="design__instance-links">
						<span className="design__instance-links-label">Results:</span>
						{ summary }
					</div>
				) }

			{ /* Load first chunk, lazy load all others as needed. */ }

			{ examples.slice( 0, examplesToMount ) }

			{ map( chunk( examples.slice( examplesToMount ), examplesToMount ), exampleGroup => {
				return (
					<LazyRender>
						{ shouldRender =>
							shouldRender ? exampleGroup : <Placeholder count={ examplesToMount } />
						}
					</LazyRender>
				);
			} ) }
		</div>
	);
};

export default Collection;
