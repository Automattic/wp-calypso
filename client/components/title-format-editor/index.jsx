/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, map, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { buildSeoTitle } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';
import TokenField from './token-input';

export class TitleFormatEditor extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		placeholder: PropTypes.string,
		type: PropTypes.object.isRequired,
		tokens: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
	};

	static defaultProps = {
		disabled: false,
		placeholder: '',
	};

	state = {
		value: [],
		};

	addToken = ( { target: { dataset: { name, title } } } ) => {
		this.editor.addToken( name, title );
		};

	storeEditor = ref => {
		this.editor = ref;
		};

	render() {
		const { disabled, titleFormats, titleData, onChange, translate, tokens, type } = this.props;

		const previewText =
			type.value && this.state.value
				? buildSeoTitle( { [ type.value ]: this.state.value }, type.value, titleData )
				: '';

		const formattedPreview = previewText ? `${ translate( 'Preview' ) }: ${ previewText }` : '';

		const editorClassNames = classNames( 'title-format-editor', {
			disabled,
		} );

		const initialValue = titleFormats.map(
			d => ( 'string' === d.type ? d : { type: d.type, value: tokens[ d.type ] } )
		);

		return (
			<div className={ editorClassNames }>
				<div className="title-format-editor__header">
					<span className="title-format-editor__title">{ type.label }</span>
					{ map( tokens, ( title, name ) => (
						<span
							key={ name }
							className="title-format-editor__button"
							data-name={ name }
							data-title={ title }
							onClick={ disabled ? noop : this.addToken }
						>
							{ title }
						</span>
					) ) }
				</div>
				<div className="title-format-editor__editor-wrapper">
					<TokenField
						ref={ this.storeEditor }
						disabled={ disabled }
						initialValue={ initialValue }
						onChange={ onChange }
					/>
				</div>
				<div className="title-format-editor__preview">{ formattedPreview }</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const site = getSelectedSite( state );
	const { moment, translate } = ownProps;
	const formattedDate = moment()
		.locale( get( site, 'lang', '' ) )
		.format( 'MMMM YYYY' );

	// Add example content for post/page title, tag name and archive dates
	return {
		titleData: {
			site,
			post: { title: translate( 'Example Title' ) },
			tag: translate( 'Example Tag' ),
			date: formattedDate,
		},
	};
};

export default localize( connect( mapStateToProps )( TitleFormatEditor ) );
