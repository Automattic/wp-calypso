/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { RichText, InnerBlocks } from '@wordpress/editor';

const blockAttributes = {
	heading: {
		source: 'children',
		selector: 'h2',
	},
};

class Heading extends Component {
	render() {
		const {
			className,
			edit,
			attributes: { anchor },
		} = this.props;
		return [
			anchor ? (
				<h2 key="heading" id={ anchor }>
					{ this.richText() }
				</h2>
			) : (
				<h2 key="heading">{ this.richText() }</h2>
			),
			<div key="headers" className={ className }>
				<header>Title</header>
				<div>Details</div>
				<footer>Status</footer>
			</div>,
			edit ? (
				<InnerBlocks
					key="children"
					allowedBlocks={ [ 'a8c/trials-list-item' ] }
					template={ [ [ 'a8c/trials-list-item', {} ] ] }
					templateLock={ false }
				/>
			) : (
				<InnerBlocks.Content key="children" />
			),
		];
	}

	richText() {
		const { attributes, setAttributes, edit } = this.props;
		return edit ? (
			<RichText
				key={ 1 }
				placeholder={ __( `Add heading…` ) }
				value={ attributes.heading }
				onChange={ value => setAttributes( { heading: value } ) }
			/>
		) : (
			attributes.heading
		);
	}
}

registerBlockType( 'a8c/trials-list', {
	title: __( 'Trial Projects' ),
	icon: 'universal-access-alt',
	category: 'common',
	supports: {
		anchor: true,
	},
	keywords: [ __( 'hiring' ), __( 'devex' ), __( 'trial' ) ],
	attributes: blockAttributes,

	edit: props => <Heading edit={ true } { ...props } />,
	save: props => <Heading edit={ false } { ...props } />,
} );
