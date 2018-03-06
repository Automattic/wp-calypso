/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import LazyRender from 'react-lazily-render';

/**
 * Internal dependencies
 */
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

class Collection extends React.PureComponent {
	static propTypes = {
		children: PropTypes.node,
		component: PropTypes.string,
		examplesToMount: PropTypes.number,
		filter: PropTypes.string,
		section: PropTypes.string,
	};

	static defaultProps = {
		examplesToMount: 7,
		section: 'design',
	};

	_setLazyRenderRef = ref => {
		this._lazyRender = ref;
	};

	componentDidMount = () => {
		this._lazyRenderTimeout = setTimeout( () => {
			// HACK: Reach into the <LazyRender> component and force all
			// examples to be mounted after a few seconds of the component
			// being mounted. This means if the user loads the page and
			// changes context the rest of the content won't wait to load
			// until they scroll down.
			this._lazyRender.stopListening();
			this._lazyRender.setState( { hasBeenScrolledIntoView: true } );
		}, 2000 );
	};

	componentWillUnmout = () => {
		clearTimeout( this._lazyRenderTimeout );
	};

	render() {
		const { children, component, examplesToMount, filter, section } = this.props;

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
					`/devdocs/design` takes a long time to mount, even when
					loaded, so we render just the first few components so
					the page change feels faster. The rest of the components
					are loaded either once scrolled to or in a few seconds
					after `componentDidMount()` is called.
				*/ }
				{ examples.length <= examplesToMount ? (
					examples
				) : (
					<React.Fragment>
						{ examples.slice( 0, examplesToMount ) }

						<LazyRender ref={ this._setLazyRenderRef }>
							{ shouldRender =>
								shouldRender ? examples.slice( examplesToMount ) : <Placeholder count={ 10 } />
							}
						</LazyRender>
					</React.Fragment>
				) }
			</div>
		);
	}
}

export default Collection;
