/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { map, chunk } from 'lodash';

/**
 * Internal dependencies
 */
import ComponentPlayground from 'devdocs/design/component-playground';
import LazyRender from 'react-lazily-render';
import DocsExampleWrapper from 'devdocs/docs-example/wrapper';
import { camelCaseToSlug, getComponentName } from 'devdocs/docs-example/util';
import ReadmeViewer from 'components/readme-viewer';
import Placeholder from 'devdocs/devdocs-async-load/placeholder';
import { getExampleCodeFromComponent } from './playground-utils';

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

const getReadmeFilePath = ( section, example ) => {
	switch ( section ) {
		case 'design':
			return `/client/components/${ example.props.readmeFilePath }/README.md`;
		default:
			return `/client/${ section }/${ example.props.readmeFilePath }/README.md`;
	}
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
		const exampleLink = `/devdocs/${ section }/${ encodeURIComponent(
			camelCaseToSlug( exampleName )
		) }`;
		const readmeFilePath = getReadmeFilePath( section, example );

		showCounter++;

		if ( filter ) {
			summary.push(
				<span key={ `instance-link-${ showCounter }` } className="design__instance-link">
					<a href={ exampleLink }>{ exampleName }</a>
				</span>
			);
		}

		const exampleCode = getExampleCodeFromComponent( example );
		if ( exampleCode ) {
			return (
				<div>
					<ComponentPlayground
						code={ exampleCode }
						name={ exampleName }
						unique={ !! component }
						url={ exampleLink }
						component={ component }
						section={ section }
					/>
					{ component && <ReadmeViewer readmeFilePath={ readmeFilePath } /> }
				</div>
			);
		}

		return (
			<div>
				<DocsExampleWrapper name={ exampleName } unique={ !! component } url={ exampleLink }>
					{ example }
				</DocsExampleWrapper>
				{ component && <ReadmeViewer readmeFilePath={ readmeFilePath } /> }
			</div>
		);
	} );

	return (
		<div className="design__collection">
			{ showCounter > 1 && filter && (
				<div className="design__instance-links">
					<span className="design__instance-links-label">Results:</span>
					{ summary }
				</div>
			) }

			{ /* Load first chunk, lazy load all others as needed. */ }

			{ examples.slice( 0, examplesToMount ) }

			{ map( chunk( examples.slice( examplesToMount ), examplesToMount ), exampleGroup => {
				const groupKey = map( exampleGroup, example => example.key ).join( '_' );
				return (
					<LazyRender key={ groupKey }>
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
