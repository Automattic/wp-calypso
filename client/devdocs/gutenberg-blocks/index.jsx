/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { registerCoreBlocks } from '@wordpress/block-library';
import page from 'page';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';
import { slugToCamelCase } from '../docs-example/util';
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';
import Collection from 'devdocs/design/search-collection';
import { GutenbergBlockExample, generateExample } from './example';
import examples from './examples';

registerCoreBlocks();

/**
 * Remote block experiment!
 */
import { upgradeElement } from '@ampproject/worker-dom/dist/index.mjs'; // TODO: use safe version?
class RemoteBlock extends React.Component {
	constructor( props ) {
		super( props );
		this.remoteBlockRef = React.createRef();
	}

	componentDidMount() {
		// let's add a mutation observer for debugging
		var targetNode = this.remoteBlockRef.current; //document.getElementById('upgrade-me');
		console.warn( 'mounted remote block', upgradeElement, targetNode );
		var config = { attributes: true, childList: true, subtree: true };
		// Callback function to execute when mutations are observed
		var callback = function( mutationsList ) {
			for ( var mutation of mutationsList ) {
				if ( mutation.type == 'childList' ) {
					console.log( 'A child node has been added or removed.' );
				} else if ( mutation.type == 'attributes' ) {
					console.log( 'The ' + mutation.attributeName + ' attribute was modified.' );
				}
			}
		};

		// Create an observer instance linked to the callback function
		var observer = new MutationObserver( callback );

		// Start observing the target node for configured mutations
		observer.observe( targetNode, config );
		console.warn( 'added mutation observer' );

		// kick off webworker
		// upgradeElement( document.getElementById('upgrade-me'), '/webworker/remote-gutenberg.js' );
		upgradeElement( targetNode, 'http://remote.localhost:3000/webworker/js/worker.mjs' );
		console.warn( 'upgraded element' );
	}

	render() {
		//http://goldsounds.ngrok.io/wp-content/plugins/portenblock/build/js/sample-block.js
		console.warn( 'rendering' );
		return (
			<div>
				<h1>Container</h1>
				<div
					src="http://remote.localhost:3000/webworker/js/remote-gutenberg-block.js"
					ref={ this.remoteBlockRef }
				>
					This is the block
				</div>
			</div>
		);
	}
}

export default class GutenbergBlocks extends React.Component {
	state = { filter: '' };

	backToAll = () => {
		page( '/devdocs/gutenberg-blocks/' );
	};

	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	render() {
		const { block } = this.props;
		const { filter } = this.state;

		const className = classnames( 'devdocs', 'devdocs__gutenberg-blocks', {
			'is-single': block,
			'is-list': ! block,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Gutenberg Blocks" />

				<RemoteBlock />

				{ block ? (
					<HeaderCake onClick={ this.backToAll } backText="All Blocks">
						{ slugToCamelCase( block ) }
					</HeaderCake>
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/gutenberg-blocks/README.md" />
						<SearchCard
							onSearch={ this.onSearch }
							initialValue={ filter }
							placeholder="Search Gutenberg blocks…"
							analyticsGroup="Docs"
						/>
					</div>
				) }

				<Collection component={ block } filter={ filter } section="gutenberg-blocks">
					{ examples.map( example => {
						const exampleCode = generateExample( example );
						return (
							<GutenbergBlockExample
								key={ example.name }
								asyncName={ example.name }
								name={ example.name }
								attributes={ example.attributes }
								inner={ example.inner }
								exampleCode={ exampleCode }
							/>
						);
					} ) }
				</Collection>
			</Main>
		);
	}
}
