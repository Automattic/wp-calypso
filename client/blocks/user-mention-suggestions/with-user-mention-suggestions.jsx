/** @format */
/**
 * External Dependencies
 */
import React from 'react';

/**
 * withUserMentionSuggestions is a higher-order component that adds user mention support to whatever input it wraps.
 *
 * @example: withUserMentionSuggestions( Component )
 *
 * @param {object} EnhancedComponent - react component to wrap
 * @returns {object} the enhanced component
 */
export default EnhancedComponent =>
	class withUserMentionSuggestions extends React.Component {
		static displayName = `withUserMentionSuggestions( ${ EnhancedComponent.displayName ||
			EnhancedComponent.name } )`;
		static propTypes = {};

		handleKeyPress = e => {
			if ( e.target.value[ e.target.value.length - 1 ] === '@' ) {
				console.log( 'found @something' ); // eslint-disable-line no-console
			}
		};

		render() {
			return (
				<div>
					<EnhancedComponent { ...this.props } onKeyPress={ this.handleKeyPress } />
				</div>
			);
		}
	};
