/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import AccordionSection from 'components/accordion/section';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';

export default React.createClass( {
	displayName: 'EditorPageTemplates',

	propTypes: {
		post: PropTypes.object,
		pageTemplates: PropTypes.array.isRequired
	},

	getDefaultProps() {
		return {
			pageTemplates: []
		};
	},

	render() {
		if ( ! this.props.pageTemplates.length || this.props.pageTemplates.length === 1 ) {
			return null;
		}
		return (
			<div>
				<label className="editor-drawer__label">
					<span className="editor-drawer__label-text">{ this.translate( 'Page Template' ) }</span>
				</label>
				{ this._renderTemplateOptions() }
			</div>
		);
	},

	_renderTemplateOptions() {
		return (
			<AccordionSection>
				<SelectDropdown selectedText={ this._getSelectedTemplateText() }>
					{
						this.props.pageTemplates.map( ( template, i ) => {
							return (
								<DropdownItem
									key={ 'page-templates-' + i }
									selected={ this._isTemplateSelected( template ) }
									onClick={ this._selectTemplate.bind( this, template ) }
								>
									{ template.label }
								</DropdownItem>
							);
						} )
					}
				</SelectDropdown>
			</AccordionSection>
		);
	},

	_isTemplateSelected( template ) {
		if ( ! this.props.post ) {
			return false;
		}
		return template.file === this.props.post.page_template;
	},

	_selectTemplate( template ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( { page_template: template.file } );
	},

	_getSelectedTemplateText() {
		const { post, pageTemplates } = this.props;

		let selectedTemplate;
		if ( post ) {
			selectedTemplate = find( pageTemplates, { file: post.page_template } );
		}

		if ( selectedTemplate ) {
			return selectedTemplate.label;
		}

		return this.translate( 'Default Template' );
	}

} );
