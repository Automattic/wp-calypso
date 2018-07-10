/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	Dashicon,
	IconButton,
	withFallbackStyles,
} from '@wordpress/components';
import {
	UrlInput,
	RichText,
	BlockControls,
	BlockAlignmentToolbar,
	ContrastChecker,
	InspectorControls,
	withColors,
	PanelColor,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

const { getComputedStyle } = window;

const ContrastCheckerWithFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor } = ownProps;
	//avoid the use of querySelector if textColor color is known and verify if node is available.
	const textNode = ! textColor && node ? node.querySelector( '[contenteditable="true"]' ) : null;
	return {
		fallbackBackgroundColor: backgroundColor || ! node ? undefined : getComputedStyle( node ).backgroundColor,
		fallbackTextColor: textColor || ! textNode ? undefined : getComputedStyle( textNode ).color,
	};
} )( ContrastChecker );

class ButtonEdit extends Component {
	constructor() {
		super( ...arguments );
		this.nodeRef = null;
		this.bindRef = this.bindRef.bind( this );
		this.updateAlignment = this.updateAlignment.bind( this );
	}

	updateAlignment( nextAlign ) {
		this.props.setAttributes( { align: nextAlign } );
	}

	bindRef( node ) {
		if ( ! node ) {
			return;
		}
		this.nodeRef = node;
	}

	render() {
		const {
			attributes,
			backgroundColor,
			textColor,
			setBackgroundColor,
			setTextColor,
			setAttributes,
			isSelected,
			className,
		} = this.props;

		const {
			text,
			url,
			title,
			align,
		} = attributes;

		return (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar value={ align } onChange={ this.updateAlignment } />
				</BlockControls>
				<span className={ className } title={ title } ref={ this.bindRef }>
					<RichText
						tagName="span"
						placeholder={ __( 'Add text…' ) }
						value={ text }
						onChange={ ( value ) => setAttributes( { text: value } ) }
						formattingControls={ [ 'bold', 'italic', 'strikethrough' ] }
						className={ classnames(
							'wp-block-button__link', {
								'has-background': backgroundColor.value,
								[ backgroundColor.class ]: backgroundColor.class,
								'has-text-color': textColor.value,
								[ textColor.class ]: textColor.class,
							}
						) }
						style={ {
							backgroundColor: backgroundColor.value,
							color: textColor.value,
						} }
						keepPlaceholderOnFocus
					/>
					<InspectorControls>
						<PanelColor
							colorValue={ backgroundColor.value }
							title={ __( 'Background Color' ) }
							onChange={ setBackgroundColor }
						/>
						<PanelColor
							colorValue={ textColor.value }
							title={ __( 'Text Color' ) }
							onChange={ setTextColor }
						/>
						{ this.nodeRef && <ContrastCheckerWithFallbackStyles
							node={ this.nodeRef }
							textColor={ textColor.value }
							backgroundColor={ backgroundColor.value }
							isLargeText={ true }
						/> }
					</InspectorControls>
				</span>
				{ isSelected && (
					<form
						className="core-blocks-button__inline-link"
						onSubmit={ ( event ) => event.preventDefault() }>
						<Dashicon icon="admin-links" />
						<UrlInput
							value={ url }
							onChange={ ( value ) => setAttributes( { url: value } ) }
						/>
						<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
					</form>
				) }
			</Fragment>
		);
	}
}

export default withColors( 'backgroundColor', { textColor: 'color' } )( ButtonEdit );
