/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

export default class MoreEdit extends Component {
	constructor() {
		super( ...arguments );
		this.onChangeInput = this.onChangeInput.bind( this );

		this.state = {
			defaultText: __( 'Read more' ),
		};
	}

	onChangeInput( event ) {
		// Set defaultText to an empty string, allowing the user to clear/replace the input field's text
		this.setState( {
			defaultText: '',
		} );

		const value = event.target.value.length === 0 ? undefined : event.target.value;
		this.props.setAttributes( { customText: value } );
	}

	render() {
		const { customText, noTeaser } = this.props.attributes;
		const { setAttributes } = this.props;

		const toggleNoTeaser = () => setAttributes( { noTeaser: ! noTeaser } );
		const { defaultText } = this.state;
		const value = customText !== undefined ? customText : defaultText;
		const inputLength = value.length + 1;

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody>
						<ToggleControl
							label={ __( 'Hide the teaser before the "More" tag' ) }
							checked={ !! noTeaser }
							onChange={ toggleNoTeaser }
						/>
					</PanelBody>
				</InspectorControls>
				<div className="wp-block-more">
					<input
						type="text"
						value={ value }
						size={ inputLength }
						onChange={ this.onChangeInput }
					/>
				</div>
			</Fragment>
		);
	}
}
