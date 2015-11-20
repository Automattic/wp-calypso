/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'ImporterIcon',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: { icon: PropTypes.oneOf( [ 'ghost', 'medium', 'squarespace', 'wordpress' ] ) },

	getSVG: function( icon ) {
		switch ( icon ) {
			case 'wordpress':
				return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM3.01 12c0-1.304.28-2.54.778-3.66l4.29 11.752c-3-1.458-5.07-4.534-5.07-8.092zM12 20.99c-.882 0-1.734-.128-2.54-.365l2.698-7.84 2.763 7.572c.02.044.042.085.065.124-.934.33-1.938.51-2.985.51zm1.24-13.206c.54-.028 1.028-.085 1.028-.085.484-.058.427-.77-.057-.742 0 0-1.455.114-2.395.114-.883 0-2.368-.114-2.368-.114-.485-.028-.542.712-.058.74 0 0 .458.058.942.086l1.4 3.838-1.967 5.9L6.49 7.785c.543-.028 1.03-.085 1.03-.085.484-.058.427-.77-.057-.742 0 0-1.456.114-2.396.114-.17 0-.368-.004-.58-.01C6.098 4.62 8.86 3.008 12 3.008c2.34 0 4.472.894 6.07 2.36-.038-.002-.076-.007-.115-.007-.883 0-1.51.77-1.51 1.596 0 .74.428 1.367.883 2.108.342.6.74 1.368.74 2.48 0 .77-.295 1.662-.683 2.906l-.897 2.996-3.25-9.666zm6.65-.098c.7 1.28 1.1 2.75 1.1 4.313 0 3.316-1.798 6.212-4.47 7.77l2.746-7.94c.513-1.283.684-2.308.684-3.22 0-.33-.022-.637-.06-.924z"/></svg>;

			default:
				return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" />;
		}
	},

	render: function() {
		const { icon } = this.props,
			iconClasses = classNames( 'importer__service-icon', `is-${ icon }` );

		return <div className={ iconClasses }>{ this.getSVG( icon ) }</div>;
	}
} );
