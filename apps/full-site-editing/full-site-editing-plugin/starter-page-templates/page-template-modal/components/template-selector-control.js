/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { parse } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';

function TemplateSelectorControl( {
	label,
	className,
	help,
	instanceId,
	onClick,
	templates = [],
} ) {
	const [ templateIndex, setTemplateIndex ] = useState( 0 );
	const template = templates[ templateIndex ];

	const renderTemplatePreview = ( { content, preview, previewAlt } ) => {
		if ( ! content ) {
			setTemplateIndex( templateIndex + 1 );
			return null;
		}

		return (
			<BlockPreview blocks={ parse( content ) } /> || (
				<img className="template-selector-control__media" src={ preview } alt={ previewAlt } />
			)
		);
	};

	const renderBlocks = useMemo( () => renderTemplatePreview( template ), templates );

	if ( isEmpty( templates ) ) {
		return null;
	}

	const id = `template-selector-control-${ instanceId }`;
	const handleButtonClick = event => onClick( event.target.value );

	return (
		<BaseControl
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector-control' ) }
		>
			<ul className="template-selector-control__options">
				{ templates.map( ( option, index ) => (
					<li key={ `${ id }-${ index }` } className="template-selector-control__option">
						<button
							type="button"
							id={ `${ id }-${ index }` }
							className="template-selector-control__label"
							value={ option.value }
							onClick={ handleButtonClick }
							aria-describedby={ help ? `${ id }__help` : undefined }
						>
							<div className="template-selector-control__media-wrap">{ renderBlocks }</div>
						</button>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
}

export default withInstanceId( TemplateSelectorControl );
