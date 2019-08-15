/**
 * External dependencies
 */
import { isEmpty, each } from 'lodash';
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

		this.blocks = {};

		// Populate this.blocks with the parsed blocks,
		// only in the dynamic preview mode.
		if ( props.templates && props.dynamicPreview ) {
			each( props.templates, ( { content, slug } ) => {
				if ( content ) {
					this.blocks[ slug ] = parseBlocks( content );
				}
			} );
		}

		this.onSelectHandler = this.onSelectHandler.bind( this );
		this.onFocusHandler = this.onFocusHandler.bind( this );
	}

	getParsedBlocks ( slug ) {
		if ( ! this.blocks || ! this.blocks[ slug ] ) {
			return [];
		}

		return this.blocks[ slug ];
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
			blocksInPreview,
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
								blocksInPreview={ blocksInPreview }
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
