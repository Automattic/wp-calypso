/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DelayRender from 'devdocs/delay-render';
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
	examplesToMount = 20,
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
					,&nbsp;
				</span>
			);
		}

		return (
			<DocsExampleWrapper name={ exampleName } unique={ !! component } url={ exampleLink }>
				{ example }
				{ component && <ReadmeViewer readmeFilePath={ example.props.readmeFilePath } /> }
			</DocsExampleWrapper>
		);
	} );

	return (
		<div className="design__collection">
			{ showCounter > 1 &&
				filter && (
					<div className="design__instance-links">
						<span>Showing </span>
						{ summary }...
					</div>
				) }
			{ /*
				The entire list of examples for `/devdocs/blocks` and
				`/devdocs/design` takes a long time to mount, so we use
				`DelayRender` to render just the first few components.
				This means the page change feels a lot faster, especially
				on lower-end machines and on Firefox.
			*/ }
			{ examples.length <= examplesToMount ? (
				examples
			) : (
				<React.Fragment>
					{ examples.slice( 0, examplesToMount ) }

					<DelayRender>
						{ shouldRender =>
							shouldRender ? (
								examples.slice( examplesToMount )
							) : (
								<Placeholder count={ examplesToMount } />
							)
						}
					</DelayRender>
				</React.Fragment>
			) }
		</div>
	);
};

export default Collection;
