/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import Field from './field';

export default React.createClass( {
	displayName: 'ContactFormDialogFieldList',

	propTypes: {
		fields: PropTypes.array.isRequired,
		onFieldAdd: PropTypes.func.isRequired,
		onFieldRemove: PropTypes.func.isRequired,
		onFieldUpdate: PropTypes.func.isRequired
	},

	render() {
		if ( this.props.fields.length > 0 ) {
			return (
				<div className="editor-contact-form-modal-fields">
					{ this.props.fields.map( ( field, index ) => {
						const { label, type, options, required } = field;
						return (
							<Field
								key={ index }
								{ ...field }
								onRemove={ () => this.props.onFieldRemove( index ) }
								onUpdate={ newField => this.props.onFieldUpdate( index, newField ) } />
						);
					} ) }
				</div>
			);
		}

		return <EmptyContent
			title={ null }
			line={ this.translate( 'An empty form is no fun! Go ahead and add some fields!' ) }
			action={ this.translate( 'Add New Field' ) }
			actionCallback={ this.props.onFieldAdd }
			isCompact={ true } />
	}
} );
