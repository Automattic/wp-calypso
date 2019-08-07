/**
 * External dependencies
 */
import { isEmpty, noop } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';

/**
 * It renders the block preview content for the template.
 * It the templates blocks are not ready yet or not exist,
 * it tries to render a static image, or simply return null.
 */
class TemplateSelectorItem extends Component {
	state = {
		blocks: [],
	};

	componentDidMount() {
		if (
			this.props.rawBlocks &&
			( ! this.state.blocks || ! this.state.blocks.length )
		) {
			this.state.blocks = parseBlocks( this.props.rawBlocks );
		}
	}

	render() {
		const { blocks } = this.state;
		const { id, value, help, onSelect, label } = this.props;

		return <button
			type="button"
			id={ `${ id }-${ value }` }
			className="template-selector-control__label"
			value={ value }
			onClick={ () => onSelect( {
				slug: value,
				blocks,
				title: label,
			} ) }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-control__media-wrap">
				{ ( blocks && blocks.length ) &&
					<BlockPreview blocks={ blocks } viewportWidth={1024}/>
				}
			</div>

			{ label }
		</button>
	}
}


function TemplateSelectorControl( {
	label,
	className,
	help,
	instanceId,
	onTemplateSelect = noop,
	templates = [],
} ) {
	if ( isEmpty( templates ) ) {
		return null;
	}

	const id = `template-selector-control-${ instanceId }`;

	return (
		<BaseControl
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector-control' ) }
		>
			<ul className="template-selector-control__options">
				{ templates.map( option => (
					<li key={ `${ id }-${ option.value }` } className="template-selector-control__option">
						<TemplateSelectorItem
							id={ id }
							value={ option.value }
							label={ option.label }
							help={ help }
							onSelect={ onTemplateSelect }
							rawBlocks={ option.rawBlocks }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
}

export default withInstanceId( TemplateSelectorControl );
