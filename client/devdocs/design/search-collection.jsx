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
import Readme from 'devdocs/docs-example/readme';

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

	return ( ! filter || searchPattern.toLowerCase().indexOf( filter ) > -1 );
};

const Collection = ( { children, filter, section = 'design', component } ) => {
	let showCounter = 0;
	const summary = [];

	const examples = React.Children.map( children, ( example ) => {
		if ( ! shouldShowInstance( example, filter, component ) ) {
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
				unique={ !! component }
				url={ exampleLink }
			>
				{ example }
				{ component ? <Readme component={ component } /> : null }
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
