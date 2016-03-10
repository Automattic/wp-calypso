/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import find from 'lodash/find';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import AccordionSection from 'components/accordion/section';
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import { setPageTemplate } from 'state/ui/editor/post/actions';

const EditorPageTemplates = React.createClass( {
	displayName: 'EditorPageTemplates',

	propTypes: {
		siteId: PropTypes.number,
		post: PropTypes.object,
		setPageTemplate: PropTypes.func,
		pageTemplates: PropTypes.array.isRequired
	},

	getDefaultProps() {
		return {
			siteId: null,
			post: {},
			setPageTemplate: () => {},
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
		this.props.setPageTemplate( get( this, 'props.siteId' ), get( this, 'props.post.ID' ), template );
	},

	_getSelectedTemplateText() {
		let post = this.props.post;
		let selectedTemplate = find( this.props.pageTemplates, ( template ) => template.file === post.page_template );
		if ( selectedTemplate ) {
			return selectedTemplate.label;
		}
		return this.translate( 'Default Template' );
	}

} );

export default connect(
	null,
	dispatch => bindActionCreators( { setPageTemplate }, dispatch )
)( EditorPageTemplates );
