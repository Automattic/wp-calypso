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
import { BlockPreview } from '@wordpress/block-editor';

function TemplateSelectorControl( {
	label,
	className,
	help,
	instanceId,
	onClick,
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
						<button
							type="button"
							id={ `${ id }-${ option.value }` }
							className="template-selector-control__label"
							value={ option.value }
							onClick={ () => onClick( option.value ) }
							aria-describedby={ help ? `${ id }__help` : undefined }
						>
							<div className="template-selector-control__media-wrap">
								<BlockPreview blocks={ option.blocks } />
							</div>
							{ option.label }
						</button>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
}

export default withInstanceId( TemplateSelectorControl );
