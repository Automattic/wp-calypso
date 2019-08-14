/**
 * External dependencies
 */
import { isEmpty, noop, each, filter } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId, compose } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { memo, Component } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';

// Load config passed from backend.
const { siteInformation = {} } = window.starterPageTemplatesConfig;

class TemplateSelectorControl extends Component {
	state = {
		blocks: {},
	};

	constructor( props ) {
		super();

		// Populate the state with the parsed blocks,
		// only in the dynamic preview mode.
		if ( props.templates && props.dynamicPreview ) {
			const blocks = {};
			each( props.templates, ( { content, slug } ) => {
				if ( content ) {
					const parsedBlocks = parseBlocks( content );
					blocks[ slug ] = {
						parsed: props.blocksInPreview ?
							parsedBlocks.slice( 0, props.blocksInPreview ) :
							parsedBlocks,
						full: ! props.blocksInPreview,
					}
				}
			} );
			this.state.blocks = blocks;
		}

		this.onSelectHandler = this.onSelectHandler.bind( this );
		this.onFocusHandler = this.onFocusHandler.bind( this );
	}

	getParsedBlocks ( slug, forceFullParsing = false ) {
		const { blocks } = this.state;
		const alreadyFullParsed = blocks && blocks[ slug ] && blocks[ slug ].full;
		// Return parsed blocks from the state if it isn't a force-full-parsing,
		// or if it's already full parsed.
		if ( ! forceFullParsing || alreadyFullParsed ) {
			return blocks && blocks[ slug ] ? blocks[ slug ].parsed : null;
		}

		// Pick up the template from the properties, according to the given slug,
		// in order to get its content.
		let template = filter( this.props.templates, { slug } );
		template = template.length ? template[ 0 ] : null;
		if ( ! template || ! template.content ) {
			return null;
		}

		// Always parse the blocks in static preview
		if ( ! this.props.dynamicPreview && ! forceFullParsing ) {
			return parseBlocks( template.content );
		}

		// proceed to parse all blocks for this template
		const allParsed = parseBlocks( template.content );
		this.setState( { blocks: { ...blocks, [ slug ]: { parsed: allParsed, full: true } } } );

		return allParsed;
	}

	onSelectHandler( slug, title ) {
		this.props.onTemplateSelect( slug, title, this.getParsedBlocks( slug, true ) );
	}

	onFocusHandler( slug, title ) {
		this.props.onTemplateFocus( slug, title, this.getParsedBlocks( slug, true ) );
	}

	render() {
		const {
			label,
			className,
			help,
			instanceId,
			templates = [],
			dynamicPreview = false,
		} = this.props;

		if ( isEmpty( templates ) ) {
			return null;
		}

		const id = `template-selector-control-${instanceId}`;

		return (
			<BaseControl
				label={ label }
				id={ id }
				help={ help }
				className={ classnames( className, 'template-selector-control' ) }
			>
				<ul className="template-selector-control__options">
					{ templates.map( ( { slug, title, preview, previewAlt, value } ) => (
						<li key={ `${id}-${value}` } className="template-selector-control__template">
							<TemplateSelectorItem
								id={ id }
								value={ slug }
								label={ replacePlaceholders( title, siteInformation ) }
								help={ help }
								onSelect={ this.onSelectHandler }
								onFocus={ this.onFocusHandler }
								preview={ preview }
								previewAlt={ previewAlt }
								blocks={ this.getParsedBlocks( slug ) }
								dynamicPreview={ dynamicPreview }
							/>
						</li>
					) ) }
				</ul>
			</BaseControl>
		);
	}
}

export default compose(
	memo,
	withInstanceId
)( TemplateSelectorControl );
