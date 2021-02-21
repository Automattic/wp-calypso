/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { filter, findLast } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocsSelectorsParamType from './param-type';

export default function DocsSelectorsResult( { url, name, description, tags, expanded } ) {
	const paramTags = filter( tags, { title: 'param' } );
	const returnTag = findLast( tags, { title: 'return' } );
	const classes = classnames( 'docs-selectors__result', {
		'is-expanded': expanded,
	} );

	return (
		<Card compact className={ classes }>
			<h1 className="docs-selectors__result-name">
				{ url && <a href={ url }>{ name }</a> }
				{ ! url && name }
			</h1>
			<p className="docs-selectors__result-description">
				{ description || <em>No description available</em> }
			</p>
			<div className="docs-selectors__result-io">
				{ paramTags.length > 0 && (
					<div className="docs-selectors__result-arguments">
						<span className="docs-selectors__result-label">Arguments</span>
						{ paramTags.map( ( tag ) => (
							<div className="docs-selectors__result-arguments-content" key={ tag.name }>
								<div className="docs-selectors__result-arguments-name">
									<strong>{ tag.name }</strong>
									<DocsSelectorsParamType { ...tag.type } />
								</div>
								<p>{ tag.description }</p>
							</div>
						) ) }
					</div>
				) }
				{ returnTag && (
					<div className="docs-selectors__result-return">
						<span className="docs-selectors__result-label">Returns</span>
						<DocsSelectorsParamType { ...returnTag.type } />
						<p>{ returnTag.description }</p>
					</div>
				) }
			</div>
		</Card>
	);
}

DocsSelectorsResult.propTypes = {
	url: PropTypes.string,
	name: PropTypes.string,
	description: PropTypes.string,
	tags: PropTypes.array,
	expanded: PropTypes.bool,
};
