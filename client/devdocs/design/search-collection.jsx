/**
 * External dependencies
 */
import React from 'react';

/**
* Internal dependencies
*/
import DocsExampleWrapper from 'devdocs/docs-example/wrapper';
import {
	camelCaseToSlug,
	getComponentName,
} from 'devdocs/docs-example/util';

const shouldShowInstance = ( example, filter ) => {
	const name = getComponentName( example );
	let searchPattern = name;

	if ( example.props.searchKeywords ) {
		searchPattern += ' ' + example.props.searchKeywords;
	}

	return ( ! filter || searchPattern.toLowerCase().indexOf( filter ) > -1 );
};

const Collection = ( { children, filter, section = 'design' } ) => {
	let showCounter = 0;
	const summary = [];

	const examples = React.Children.map( children, ( example ) => {
		if ( ! example || ! shouldShowInstance( example, filter ) ) {
			return null;
		}

		const exampleName = getComponentName( example );
		const exampleLink = `./${ section }/${ camelCaseToSlug( exampleName ) }`;

		showCounter++;

		if ( filter ) {
			summary.push(
				<span
					key={ `instance-link-${ showCounter }` }
					className="design__instance-link"
				>
					<a href={ exampleLink }>
						{ exampleName }
					</a>
					,&nbsp;
				</span>
			);
		}

		return (
			<DocsExampleWrapper
				name={ exampleName }
				url={ exampleLink }
			>
				{ example }
			</DocsExampleWrapper>
		);
	} );

	return (
		<div className="design__collection">
			{ showCounter > 1 && filter &&
				<div className="design__instance-links">
					<span>Showing </span>{ summary }...
				</div>
			}
			{ examples }
		</div>
	);
};

export default Collection;
