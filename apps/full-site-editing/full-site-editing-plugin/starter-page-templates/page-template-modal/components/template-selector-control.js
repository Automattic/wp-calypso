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
	selected,
	help,
	instanceId,
	onChange,
	templates = [],
} ) {
	const id = `inspector-radio-control-${ instanceId }`;
	const onChangeValue = event => onChange( event.target.value );

	return (
		! isEmpty( templates ) && (
			<BaseControl
				label={ label }
				id={ id }
				help={ help }
				className={ classnames( className, 'template-selector-control' ) }
			>
				{ templates.map( ( option, index ) => (
					<div key={ `${ id }-${ index }` } className="template-selector-control__option">
						<input
							id={ `${ id }-${ index }` }
							className="template-selector-control__input"
							type="radio"
							name={ id }
							value={ option.value }
							onChange={ onChangeValue }
							checked={ option.value === selected }
							aria-describedby={ help ? `${ id }__help` : undefined }
						/>
						<label className="template-selector-control__label" htmlFor={ `${ id }-${ index }` }>
							<img className="template-selector-control__media" src={ option.preview } alt="" />
							{ option.label }
						</label>
					</div>
				) ) }
			</BaseControl>
		)
	);
}

export default withInstanceId( TemplateSelectorControl );
