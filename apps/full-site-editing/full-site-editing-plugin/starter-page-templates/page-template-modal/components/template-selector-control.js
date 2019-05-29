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

function TemplateSelectorControl( {
	label,
	className,
	help,
	instanceId,
	onClick,
	templates = [],
} ) {
	const id = `inspector-radio-control-${ instanceId }`;
	const handleButtonClick = event => onClick( event.target.value );

	if ( isEmpty( templates ) ) {
		return null;
	}

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
							<div className="template-selector-control__media-wrap">
								{ option.preview && (
									<img
										className="template-selector-control__media"
										src={ option.preview }
										alt={ option.previewAlt || '' }
									/>
								) }
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
