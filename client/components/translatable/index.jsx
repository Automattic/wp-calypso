/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';


class Translatable extends Component {
	state = {
		showTooltip: false,
		translatedData: null,
	};

	timeout = null;

	hoverTriggerValue = 1000;

	refCallback = elem => ( this.elem = elem );

	togglePopover = event => {
		event.preventDefault();


		this.timeout = setTimeout( () => {
			this.setState( { showTooltip: true } );
			const { singular, context, plural } = this.props;

			/* temp xhr code for demonstration purposes */
			const xhr = new XMLHttpRequest();

			if ( 'withCredentials' in xhr ) {
				xhr.open( 'POST', 'https://translate.wordpress.com/api/translations/-query-by-originals', true );
				xhr.withCredentials = true;
				xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

				const data = {
					project: 'wpcom',
					locale_slug: 'it',
					original_strings: { singular, context, plural },
				};

				xhr.onreadystatechange = () => {
					if ( xhr.readyState > 3 && xhr.status === 200 ) {
						this.setState( { translatedData: JSON.parse( xhr.responseText ) } );
					};
				};
				const params = `project=wpcom&locale_slug=it&original_strings=${ encodeURIComponent( JSON.stringify( data ) ) }`;

				xhr.send( params );
			}
		}, this.hoverTriggerValue );

		if ( this.state.translatedData ) {
			return;
		}
	};

	resetTimer = () => {
		clearTimeout( this.timeout );
		// this.setState( { showTooltip: false } );
	}

	render() {
		const translatedStr = this.state.translatedData ? this.state.translatedData[ 0 ].translations[0][ 'translation_0' ] : '';
		// eslint-disable-next-line
		console.log( 'this.props.children', this.props.children );

		return (
			<data
				title={ 'do it' }
				className="translatable translatable__community-translator"
				onMouseEnter={ this.togglePopover }
				onMouseLeave={ this.resetTimer }
				ref={ this.refCallback }
				{ ...this.props }
			>
				{ this.props.children }

				{ this.state.showTooltip && <Popover
					isVisible={ this.state.showTooltip }
					context={ this.elem }
					onClose={ noop }
					position="bottom"
					className="translatable__popover popover"
				>
					<div className="translatable__popover-content">
						<h4>Original string</h4>
						<p>{ this.props.singular }</p>
						<p>Submit a new translation</p>
					</div>
				</Popover> }
			</data>
		);
	}
}

export default Translatable;
