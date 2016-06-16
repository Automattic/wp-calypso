/** @ssr-ready **/

/* !!!
IF YOU ARE EDITING gridicon/index.jsx
THEN YOU ARE EDITING A FILE THAT GETS OUTPUT FROM THE GRIDICONS REPO!
DO NOT EDIT THAT FILE! EDIT index-header.jsx and index-footer.jsx instead
OR if you're looking to change now SVGs get output, you'll need to edit strings in the Gruntfile :)
!!! */

/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	classNames = require( 'classnames' );

var Gridicon = React.createClass( {

	mixins: [ PureRenderMixin ],

	getDefaultProps: function() {
		return {
			className: '',
			size: 24
		};
	},

	propTypes: {
		icon: React.PropTypes.string.isRequired,
		size: React.PropTypes.number,
		onClick: React.PropTypes.func,
		className: React.PropTypes.string
	},

	needsOffset: function( icon, size ) {
		var iconNeedsOffset = [
			'gridicons-add-outline',
			'gridicons-add',
			'gridicons-align-image-center',
			'gridicons-align-image-left',
			'gridicons-align-image-none',
			'gridicons-align-image-right',
			'gridicons-attachment',
			'gridicons-bold',
			'gridicons-bookmark-outline',
			'gridicons-bookmark',
			'gridicons-calendar',
			'gridicons-cart',
			'gridicons-create',
			'gridicons-custom-post-type',
			'gridicons-external',
			'gridicons-folder',
			'gridicons-heading',
			'gridicons-help-outline',
			'gridicons-help',
			'gridicons-history',
			'gridicons-info-outline',
			'gridicons-info',
			'gridicons-italic',
			'gridicons-layout-blocks',
			'gridicons-link-break',
			'gridicons-link',
			'gridicons-list-checkmark',
			'gridicons-list-ordered',
			'gridicons-list-unordered',
			'gridicons-menus',
			'gridicons-minus',
			'gridicons-my-sites',
			'gridicons-notice-outline',
			'gridicons-notice',
			'gridicons-plus-small',
			'gridicons-plus',
			'gridicons-popout',
			'gridicons-posts',
			'gridicons-scheduled',
			'gridicons-share-ios',
			'gridicons-star-outline',
			'gridicons-star',
			'gridicons-stats',
			'gridicons-status',
			'gridicons-thumbs-up',
			'gridicons-textcolor',
			'gridicons-time',
			'gridicons-trophy',
			'gridicons-user-circle',
			'gridicons-reader-follow',
			'gridicons-reader-following'
		];

		if ( iconNeedsOffset.indexOf( icon ) >= 0 ) {
			return ( size % 18 === 0 );
		} else {
			return false;
		}
	},

	needsOffsetX: function( icon, size ) {
		var iconNeedsOffsetX = [
			'gridicons-arrow-down',
			'gridicons-arrow-up',
			'gridicons-comment',
			'gridicons-clear-formatting',
			'gridicons-flag',
			'gridicons-menu',
			'gridicons-reader',
			'gridicons-strikethrough'
		];

		if ( iconNeedsOffsetX.indexOf( icon ) >= 0 ) {
			return ( size % 18 === 0 );
		} else {
			return false;
		}
	},

	needsOffsetY: function( icon, size ) {
		var iconNeedsOffsetY = [
			'gridicons-align-center',
			'gridicons-align-justify',
			'gridicons-align-left',
			'gridicons-align-right',
			'gridicons-arrow-left',
			'gridicons-arrow-right',
			'gridicons-house',
			'gridicons-indent-left',
			'gridicons-indent-right',
			'gridicons-minus-small',
			'gridicons-print',
			'gridicons-sign-out',
			'gridicons-stats-alt',
			'gridicons-trash',
			'gridicons-underline',
			'gridicons-video-camera'
		];

		if ( iconNeedsOffsetY.indexOf( icon ) >= 0 ) {
			return ( size % 18 === 0 );
		} else {
			return false;
		}
	},

	render: function() {
		var icon = 'gridicons-' + this.props.icon,
			needsOffset = this.needsOffset( icon, this.props.size ),
			needsOffsetX = this.needsOffsetX( icon, this.props.size ),
			needsOffsetY = this.needsOffsetY( icon, this.props.size ),
			svg, iconClass;

		iconClass = classNames( 'gridicon', icon, this.props.className, {
			'needs-offset': needsOffset,
			'needs-offset-x': needsOffsetX,
			'needs-offset-y': needsOffsetY,
		} );

		switch ( icon ) {
			default:
				svg = <svg height={ this.props.size } width={ this.props.size } />;
				break;
			case 'gridicons-add-image':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23 4v2h-3v3h-2V6h-3V4h3V1h2v3h3zm-8.5 7c.828 0 1.5-.672 1.5-1.5S15.328 8 14.5 8 13 8.672 13 9.5s.672 1.5 1.5 1.5zm3.5 3.234l-.513-.57c-.794-.885-2.18-.885-2.976 0l-.655.73L9 9l-3 3.333V6h7V4H6c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2v-7h-2v3.234z"/></g></svg>;
				break;
			case 'gridicons-add-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 9h-4V7h-2v4H7v2h4v4h2v-4h4v-2z"/></g></svg>;
				break;
			case 'gridicons-add':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></g></svg>;
				break;
			case 'gridicons-align-center':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 19h16v-2H4v2zm13-6H7v2h10v-2zM4 9v2h16V9H4zm13-4H7v2h10V5z"/></g></svg>;
				break;
			case 'gridicons-align-image-center':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 5h18v2H3V5zm0 14h18v-2H3v2zm5-4h8V9H8v6z"/></g></svg>;
				break;
			case 'gridicons-align-image-left':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 5h18v2H3V5zm0 14h18v-2H3v2zm0-4h8V9H3v6zm10 0h8v-2h-8v2zm0-4h8V9h-8v2z"/></g></svg>;
				break;
			case 'gridicons-align-image-none':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 7H3V5h18v2zm0 10H3v2h18v-2zM11 9H3v6h8V9z"/></g></svg>;
				break;
			case 'gridicons-align-image-right':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 7H3V5h18v2zm0 10H3v2h18v-2zm0-8h-8v6h8V9zm-10 4H3v2h8v-2zm0-4H3v2h8V9z"/></g></svg>;
				break;
			case 'gridicons-align-justify':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 19h16v-2H4v2zm16-6H4v2h16v-2zM4 9v2h16V9H4zm16-4H4v2h16V5z"/></g></svg>;
				break;
			case 'gridicons-align-left':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 19h16v-2H4v2zm10-6H4v2h10v-2zM4 9v2h16V9H4zm10-4H4v2h10V5z"/></g></svg>;
				break;
			case 'gridicons-align-right':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 17H4v2h16v-2zm-10-2h10v-2H10v2zM4 9v2h16V9H4zm6-2h10V5H10v2z"/></g></svg>;
				break;
			case 'gridicons-arrow-down':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M11 4v12.17l-5.59-5.59L4 12l8 8 8-8-1.41-1.41L13 16.17V4h-2z"/></g></svg>;
				break;
			case 'gridicons-arrow-left':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></g></svg>;
				break;
			case 'gridicons-arrow-right':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></g></svg>;
				break;
			case 'gridicons-arrow-up':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M13 20V7.83l5.59 5.59L20 12l-8-8-8 8 1.41 1.41L11 7.83V20h2z"/></g></svg>;
				break;
			case 'gridicons-aside':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M14 20l6-6V6c0-1.105-.895-2-2-2H6c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h8zM6 6h12v6h-4c-1.105 0-2 .895-2 2v4H6V6zm10 4H8V8h8v2z"/></g></svg>;
				break;
			case 'gridicons-attachment':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M14 1c-2.762 0-5 2.238-5 5v10c0 1.657 1.343 3 3 3s2.99-1.343 2.99-3V6H13v10c0 .553-.447 1-1 1-.553 0-1-.447-1-1V6c0-1.657 1.343-3 3-3s3 1.343 3 3v10.125C17 18.887 14.762 21 12 21s-5-2.238-5-5v-5H5v5c0 3.866 3.134 7 7 7s6.99-3.134 6.99-7V6c0-2.762-2.228-5-4.99-5z"/></g></svg>;
				break;
			case 'gridicons-audio':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M8 4v10.184C7.686 14.072 7.353 14 7 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7h7v4.184c-.314-.112-.647-.184-1-.184-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V4H8z"/></g></svg>;
				break;
			case 'gridicons-bell':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M6.14 14.97l2.828 2.827c-.362.362-.862.586-1.414.586-1.105 0-2-.895-2-2 0-.552.224-1.052.586-1.414zm8.867 5.324L14.3 21 3 9.7l.706-.707 1.102.157c.754.108 1.69-.122 2.077-.51l3.885-3.884c2.34-2.34 6.135-2.34 8.475 0s2.34 6.135 0 8.475l-3.885 3.886c-.388.388-.618 1.323-.51 2.077l.157 1.1z"/></g></svg>;
				break;
			case 'gridicons-block':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4 12c0-4.418 3.582-8 8-8 1.848 0 3.545.633 4.9 1.686L5.686 16.9C4.633 15.545 4 13.848 4 12zm8 8c-1.848 0-3.546-.633-4.9-1.686L18.314 7.1C19.367 8.455 20 10.152 20 12c0 4.418-3.582 8-8 8z"/></g></svg>;
				break;
			case 'gridicons-bold':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M7 5.01h4.547c2.126 0 3.67.302 4.632.906.96.605 1.44 1.567 1.44 2.887 0 .896-.21 1.63-.63 2.205-.42.574-.98.92-1.678 1.036v.103c.95.212 1.637.608 2.057 1.19.42.58.63 1.35.63 2.315 0 1.367-.494 2.434-1.482 3.2-.99.765-2.332 1.148-4.027 1.148H7V5.01zm3 5.936h2.027c.862 0 1.486-.133 1.872-.4.386-.267.578-.708.578-1.323 0-.574-.21-.986-.63-1.236-.42-.25-1.087-.374-1.996-.374H10v3.333zm0 2.523v3.905h2.253c.876 0 1.52-.167 1.94-.502.416-.335.625-.848.625-1.54 0-1.243-.89-1.864-2.668-1.864H10z"/></g></svg>;
				break;
			case 'gridicons-book':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 3h2v18H4zM18 3H7v18h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 6h-6V8h6v1zm0-2h-6V6h6v1z"/></g></svg>;
				break;
			case 'gridicons-bookmark-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 5v12.554l-5-2.857-5 2.857V5h10m0-2H7c-1.105 0-2 .896-2 2v16l7-4 7 4V5c0-1.104-.896-2-2-2z"/></g></svg>;
				break;
			case 'gridicons-bookmark':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 3H7c-1.105 0-2 .896-2 2v16l7-4 7 4V5c0-1.104-.896-2-2-2z"/></g></svg>;
				break;
			case 'gridicons-briefcase':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M14 15h-4v-2H2v6c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2v-6h-8v2zm6-9h-2V4c0-1.105-.895-2-2-2H8c-1.105 0-2 .895-2 2v2H4c-1.105 0-2 .895-2 2v4h20V8c0-1.105-.895-2-2-2zm-4 0H8V4h8v2z"/></g></svg>;
				break;
			case 'gridicons-calendar':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.105 0-2 .896-2 2v13c0 1.104.895 2 2 2h14c1.104 0 2-.896 2-2V6c0-1.104-.896-2-2-2zm0 15H5V8h14v11z"/></g></svg>;
				break;
			case 'gridicons-camera':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 12c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3 3 1.3 3 3zm5-5v11c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2V4h4v1h2l1-2h6l1 2h2c1.1 0 2 .9 2 2zM7.5 9c0-.8-.7-1.5-1.5-1.5S4.5 8.2 4.5 9s.7 1.5 1.5 1.5S7.5 9.8 7.5 9zM19 12c0-2.8-2.2-5-5-5s-5 2.2-5 5 2.2 5 5 5 5-2.2 5-5z"/></g></svg>;
				break;
			case 'gridicons-caption':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 15l2-2v5c0 1.105-.895 2-2 2H4c-1.105 0-2-.895-2-2V6c0-1.105.895-2 2-2h13l-2 2H4v12h16v-3zm2.44-8.56l-.88-.88c-.586-.585-1.534-.585-2.12 0L12 13v2H6v2h9v-1l7.44-7.44c.585-.586.585-1.534 0-2.12z"/></g></svg>;
				break;
			case 'gridicons-cart':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9 20c0 1.1-.9 2-2 2s-1.99-.9-1.99-2S5.9 18 7 18s2 .9 2 2zm8-2c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm.396-5c.937 0 1.75-.65 1.952-1.566L21 5H7V4c0-1.105-.895-2-2-2H3v2h2v11c0 1.105.895 2 2 2h12c0-1.105-.895-2-2-2H7v-2h10.396z"/></g></svg>;
				break;
			case 'gridicons-checkmark-circle':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M11 17.768l-4.884-4.884 1.768-1.768L11 14.232l8.658-8.658C17.823 3.39 15.075 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-1.528-.353-2.97-.966-4.266L11 17.768z"/></g></svg>;
				break;
			case 'gridicons-checkmark':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9 19.414l-6.707-6.707 1.414-1.414L9 16.586 20.293 5.293l1.414 1.414"/></g></svg>;
				break;
			case 'gridicons-chevron-down':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 9l-8 8-8-8 1.414-1.414L12 14.172l6.586-6.586"/></g></svg>;
				break;
			case 'gridicons-chevron-left':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M14 20l-8-8 8-8 1.414 1.414L8.828 12l6.586 6.586"/></g></svg>;
				break;
			case 'gridicons-chevron-right':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M10 20l8-8-8-8-1.414 1.414L15.172 12l-6.586 6.586"/></g></svg>;
				break;
			case 'gridicons-chevron-up':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 15l8-8 8 8-1.414 1.414L12 9.828l-6.586 6.586"/></g></svg>;
				break;
			case 'gridicons-clear-formatting':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M10.837 10.163l-4.6 4.6L10 4h4l.777 2.223-2.144 2.144-.627-2.092-1.17 3.888zm5.495.506L19.244 19H15.82l-1.05-3.5H11.5L5 22l-1.5-1.5 17-17L22 5l-5.668 5.67zm-2.31 2.31l-.032.03.032-.01v-.02z"/></g></svg>;
				break;
			case 'gridicons-clipboard':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 18H8v-2h8v2zm0-6H8v2h8v-2zm2-9h-2v2h2v15H6V5h2V3H6c-1.105 0-2 .895-2 2v15c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2zm-4 2V4c0-1.105-.895-2-2-2s-2 .895-2 2v1c-1.105 0-2 .895-2 2v1h8V7c0-1.105-.895-2-2-2z"/></g></svg>;
				break;
			case 'gridicons-cloud-download':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 9c-.01 0-.017.002-.025.003C17.72 5.646 14.922 3 11.5 3 7.91 3 5 5.91 5 9.5c0 .524.07 1.03.186 1.52C5.123 11.015 5.064 11 5 11c-2.21 0-4 1.79-4 4 0 1.202.54 2.267 1.38 3h18.593C22.196 17.09 23 15.643 23 14c0-2.76-2.24-5-5-5zm-6 7l-4-5h3V8h2v3h3l-4 5z"/></g></svg>;
				break;
			case 'gridicons-cloud-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M11.5 5c2.336 0 4.304 1.825 4.48 4.154l.142 1.86 1.867-.012h.092C19.698 11.043 21 12.37 21 14c0 .748-.28 1.452-.783 2H3.28c-.156-.256-.28-.59-.28-1 0-1.074.85-1.953 1.915-1.998.06.007.118.012.178.015l2.66.124-.622-2.587C7.044 10.186 7 9.843 7 9.5 7 7.02 9.02 5 11.5 5m0-2C7.91 3 5 5.91 5 9.5c0 .524.07 1.03.186 1.52C5.123 11.015 5.064 11 5 11c-2.21 0-4 1.79-4 4 0 1.202.54 2.267 1.38 3h18.593C22.196 17.09 23 15.643 23 14c0-2.76-2.24-5-5-5l-.025.002C17.72 5.646 14.922 3 11.5 3z"/></g></svg>;
				break;
			case 'gridicons-cloud-upload':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 9c-.01 0-.017.002-.025.003C17.72 5.646 14.922 3 11.5 3 7.91 3 5 5.91 5 9.5c0 .524.07 1.03.186 1.52C5.123 11.015 5.064 11 5 11c-2.21 0-4 1.79-4 4 0 1.202.54 2.267 1.38 3h18.593C22.196 17.09 23 15.643 23 14c0-2.76-2.24-5-5-5zm-5 4v3h-2v-3H8l4-5 4 5h-3z"/></g></svg>;
				break;
			case 'gridicons-cloud':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 9c-.01 0-.017.002-.025.003C17.72 5.646 14.922 3 11.5 3 7.91 3 5 5.91 5 9.5c0 .524.07 1.03.186 1.52C5.123 11.015 5.064 11 5 11c-2.21 0-4 1.79-4 4 0 1.202.54 2.267 1.38 3h18.593C22.196 17.09 23 15.643 23 14c0-2.76-2.24-5-5-5z"/></g></svg>;
				break;
			case 'gridicons-code':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4.83 12l4.58 4.59L8 18l-6-6 6-6 1.41 1.41L4.83 12zm9.76 4.59L16 18l6-6-6-6-1.41 1.41L19.17 12l-4.58 4.59z"/></g></svg>;
				break;
			case 'gridicons-cog':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 12c0-.568-.06-1.122-.174-1.656l1.834-1.612-2-3.464-2.322.786c-.82-.736-1.787-1.308-2.86-1.657L14 2h-4l-.48 2.396c-1.07.35-2.04.92-2.858 1.657L4.34 5.268l-2 3.464 1.834 1.612C4.06 10.878 4 11.432 4 12s.06 1.122.174 1.656L2.34 15.268l2 3.464 2.322-.786c.82.736 1.787 1.308 2.86 1.657L10 22h4l.48-2.396c1.07-.35 2.038-.92 2.858-1.657l2.322.786 2-3.464-1.834-1.613c.113-.535.174-1.09.174-1.657zm-8 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></g></svg>;
				break;
			case 'gridicons-comment':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 6v9c0 1.105.895 2 2 2h9v5l5.325-3.804c1.05-.75 1.675-1.963 1.675-3.254V6c0-1.105-.895-2-2-2H5c-1.105 0-2 .895-2 2z"/></g></svg>;
				break;
			case 'gridicons-computer':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 2H4c-1.104 0-2 .896-2 2v12c0 1.104.896 2 2 2h6v2H7v2h10v-2h-3v-2h6c1.104 0 2-.896 2-2V4c0-1.104-.896-2-2-2zm0 14H4V4h16v12z"/></g></svg>;
				break;
			case 'gridicons-coupon':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M13 16v2h-2v-2h2zm3-3h2v-2h-2v2zm2 8h-2v2h2v-2zm3-5v2h2v-2h-2zm-1-3c.552 0 1 .448 1 1h2c0-1.657-1.343-3-3-3v2zm1 7c0 .552-.448 1-1 1v2c1.657 0 3-1.343 3-3h-2zm-7 1c-.552 0-1-.448-1-1h-2c0 1.657 1.343 3 3 3v-2zm3.21-5.21c-.78.78-2.047.782-2.828.002l-.002-.002L10 11.41l-1.43 1.44c.28.506.427 1.073.43 1.65C9 16.433 7.433 18 5.5 18S2 16.433 2 14.5 3.567 11 5.5 11c.577.003 1.144.15 1.65.43L8.59 10 7.15 8.57c-.506.28-1.073.427-1.65.43C3.567 9 2 7.433 2 5.5S3.567 2 5.5 2 9 3.567 9 5.5c-.003.577-.15 1.144-.43 1.65L10 8.59l3.88-3.88c.78-.78 2.047-.782 2.828-.002l.002.002-5.3 5.29 5.8 5.79zM5.5 7C6.328 7 7 6.328 7 5.5S6.328 4 5.5 4 4 4.672 4 5.5 4.672 7 5.5 7zM7 14.5c0-.828-.672-1.5-1.5-1.5S4 13.672 4 14.5 4.672 16 5.5 16 7 15.328 7 14.5z"/></g></svg>;
				break;
			case 'gridicons-create':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 11v8c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2h8l-2 2H5v14h14v-6l2-2zM7 17h3l7.5-7.5-3-3L7 14v3zm9.94-12.94L15.5 5.5l3 3 1.44-1.44c.585-.585.585-1.535 0-2.12l-.88-.88c-.585-.585-1.535-.585-2.12 0z"/></g></svg>;
				break;
			case 'gridicons-credit-card':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 4H4c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zm0 2v2H4V6h16zM4 18v-6h16v6H4zm2-4h7v2H6v-2zm9 0h3v2h-3v-2z"/></g></svg>;
				break;
			case 'gridicons-crop':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 16h-4V8c0-1.105-.895-2-2-2H8V2H6v4H2v2h4v8c0 1.105.895 2 2 2h8v4h2v-4h4v-2zM8 16V8h8v8H8z"/></g></svg>;
				break;
			case 'gridicons-cross-circle':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19.1 4.9C15.2 1 8.8 1 4.9 4.9S1 15.2 4.9 19.1s10.2 3.9 14.1 0 4-10.3.1-14.2zm-4.3 11.3L12 13.4l-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4 2.8 2.8 2.8-2.8 1.4 1.4-2.8 2.8 2.8 2.8-1.4 1.4z"/></g></svg>;
				break;
			case 'gridicons-cross-small':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg>;
				break;
			case 'gridicons-cross':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><title>gridicons-cross</title><path d="M18.36 19.78L12 13.41l-6.36 6.37-1.42-1.42L10.59 12 4.22 5.64l1.42-1.42L12 10.59l6.36-6.36 1.41 1.41L13.41 12l6.36 6.36z"/></g></svg>;
				break;
			case 'gridicons-custom-post-type':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19 3H5c-1.105 0-2 .895-2 2v14c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2zM6 6h5v5H6V6zm4.5 13C9.12 19 8 17.88 8 16.5S9.12 14 10.5 14s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm3-6l3-5 3 5h-6z"/></g></svg>;
				break;
			case 'gridicons-customize':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M2 6c0-1.505.78-3.08 2-4 0 .845.69 2 2 2 1.657 0 3 1.343 3 3 0 .386-.08.752-.212 1.09.74.594 1.476 1.19 2.19 1.81L8.9 11.98c-.62-.716-1.214-1.454-1.807-2.192C6.753 9.92 6.387 10 6 10c-2.21 0-4-1.79-4-4zm12.152 6.848l1.34-1.34c.607.304 1.283.492 2.008.492 2.485 0 4.5-2.015 4.5-4.5 0-.725-.188-1.4-.493-2.007L18 9l-2-2 3.507-3.507C18.9 3.188 18.225 3 17.5 3 15.015 3 13 5.015 13 7.5c0 .725.188 1.4.493 2.007L3 20l2 2 6.848-6.848c1.885 1.928 3.874 3.753 5.977 5.45l1.425 1.148 1.5-1.5-1.15-1.425c-1.695-2.103-3.52-4.092-5.448-5.977z"/></g></svg>;
				break;
			case 'gridicons-domains':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.918 6h-3.215c-.188-1.424-.42-2.65-.565-3.357 1.593.682 2.916 1.87 3.78 3.357zm-5.904-3.928c.068.352.387 2.038.645 3.928h-3.32c.26-1.89.578-3.576.646-3.928C11.32 4.03 11.656 4 12 4s.68.03 1.014.072zM14 12c0 .598-.043 1.286-.11 2h-3.78c-.067-.714-.11-1.402-.11-2s.043-1.286.11-2h3.78c.067.714.11 1.402.11 2zM8.862 4.643C8.717 5.35 8.485 6.576 8.297 8H5.082c.864-1.487 2.187-2.675 3.78-3.357zM4.262 10h3.822c-.05.668-.084 1.344-.084 2s.033 1.332.085 2H4.263C4.097 13.36 4 12.692 4 12s.098-1.36.263-2zm.82 6h3.215c.188 1.424.42 2.65.565 3.357-1.593-.682-2.916-1.87-3.78-3.357zm5.904 3.928c-.068-.353-.388-2.038-.645-3.928h3.32c-.26 1.89-.578 3.576-.646 3.928-.333.043-.67.072-1.014.072s-.68-.03-1.014-.072zm4.152-.57c.145-.708.377-1.934.565-3.358h3.215c-.864 1.487-2.187 2.675-3.78 3.357zm4.6-5.358h-3.822c.05-.668.084-1.344.084-2s-.033-1.332-.085-2h3.82c.167.64.265 1.308.265 2s-.097 1.36-.263 2z"/></g></svg>;
				break;
			case 'gridicons-dropdown':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M7 10l5 5 5-5"/></g></svg>;
				break;
			case 'gridicons-ellipsis-circle':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM7.5 13.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5S9 11.2 9 12s-.7 1.5-1.5 1.5zm4.5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4.5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/></g></svg>;
				break;
			case 'gridicons-ellipsis':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M7 12c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm12-2c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm-7 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2z"/></g></svg>;
				break;
			case 'gridicons-external':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19 13v6c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V7c0-1.105.895-2 2-2h6v2H5v12h12v-6h2zM13 3v2h4.586l-7.793 7.793 1.414 1.414L19 6.414V11h2V3h-8z"/></g></svg>;
				break;
			case 'gridicons-flag':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M15 6c0-1.105-.895-2-2-2H5v17h2v-7h5c0 1.105.895 2 2 2h6V6h-5z"/></g></svg>;
				break;
			case 'gridicons-flip-horizontal':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 18v-5h3v-2h-3V6c0-1.105-.895-2-2-2H6c-1.105 0-2 .895-2 2v5H1v2h3v5c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2zM6 6h12v5H6V6z"/></g></svg>;
				break;
			case 'gridicons-flip-vertical':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 4h-5V1h-2v3H6c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h5v3h2v-3h5c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zM6 18V6h5v12H6z"/></g></svg>;
				break;
			case 'gridicons-folder-multiple':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 8c-1.105 0-2 .895-2 2v10c0 1.1.9 2 2 2h14c1.105 0 2-.895 2-2H4V8zm16 10H8c-1.105 0-2-.895-2-2V6c0-1.105.895-2 2-2h3c1.105 0 2 .895 2 2h7c1.105 0 2 .895 2 2v8c0 1.105-.895 2-2 2z"/></g></svg>;
				break;
			case 'gridicons-folder':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 19H6c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2h7c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2z"/></g></svg>;
				break;
			case 'gridicons-globe':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18l2-2 1-1v-2h-2v-1l-1-1H9v3l2 2v1.93c-3.94-.494-7-3.858-7-7.93l1 1h2v-2h2l3-3V6h-2L9 5v-.41C9.927 4.21 10.94 4 12 4s2.073.212 3 .59V6l-1 1v2l1 1 3.13-3.13c.752.897 1.304 1.964 1.606 3.13H18l-2 2v2l1 1h2l.286.286C18.03 18.06 15.24 20 12 20z"/></g></svg>;
				break;
			case 'gridicons-grid':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M8 8H4V4h4v4zm6-4h-4v4h4V4zm6 0h-4v4h4V4zM8 10H4v4h4v-4zm6 0h-4v4h4v-4zm6 0h-4v4h4v-4zM8 16H4v4h4v-4zm6 0h-4v4h4v-4zm6 0h-4v4h4v-4z"/></g></svg>;
				break;
			case 'gridicons-heading':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 20h-3v-6H9v6H6V5.01h3V11h6V5.01h3V20z"/></g></svg>;
				break;
			case 'gridicons-heart-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16.5 4.5c2.206 0 4 1.794 4 4 0 4.67-5.543 8.94-8.5 11.023C9.043 17.44 3.5 13.17 3.5 8.5c0-2.206 1.794-4 4-4 1.298 0 2.522.638 3.273 1.706L12 7.953l1.227-1.746c.75-1.07 1.975-1.707 3.273-1.707m0-1.5c-1.862 0-3.505.928-4.5 2.344C11.005 3.928 9.362 3 7.5 3 4.462 3 2 5.462 2 8.5c0 5.72 6.5 10.438 10 12.85 3.5-2.412 10-7.13 10-12.85C22 5.462 19.538 3 16.5 3z"/></g></svg>;
				break;
			case 'gridicons-heart':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16.5 3c-1.862 0-3.505.928-4.5 2.344C11.005 3.928 9.362 3 7.5 3 4.462 3 2 5.462 2 8.5c0 5.72 6.5 10.438 10 12.85 3.5-2.412 10-7.13 10-12.85C22 5.462 19.538 3 16.5 3z"/></g></svg>;
				break;
			case 'gridicons-help-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4 8c0-2.21-1.79-4-4-4s-4 1.79-4 4h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2c-.552 0-1 .448-1 1v2h2v-1.14c1.722-.447 3-1.998 3-3.86zm-3 6h-2v2h2v-2z"/></g></svg>;
				break;
			case 'gridicons-help':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 16h-2v-2h2v2zm0-4.14V15h-2v-2c0-.552.448-1 1-1 1.103 0 2-.897 2-2s-.897-2-2-2-2 .897-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.862-1.278 3.413-3 3.86z"/></g></svg>;
				break;
			case 'gridicons-history':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M2.12 13.526c.742 4.78 4.902 8.47 9.88 8.47 5.5 0 10-4.5 10-9.998S17.5 2 12 2C8.704 2 5.802 3.6 4 6V2H2.003L2 9h7V7H5.8c1.4-1.8 3.702-3 6.202-3C16.4 4 20 7.6 20 11.998s-3.6 8-8 8c-3.877 0-7.13-2.795-7.848-6.472H2.12z"/><path d="M11.002 7v5.3l3.2 4.298 1.6-1.197-2.8-3.7V7"/></g></svg>;
				break;
			case 'gridicons-house':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 9L12 1 2 9v2h2v10h5v-4c0-1.657 1.343-3 3-3s3 1.343 3 3v4h5V11h2V9z"/></g></svg>;
				break;
			case 'gridicons-image-multiple':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M15 7.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5S17.328 9 16.5 9 15 8.328 15 7.5zM4 20h14c0 1.105-.895 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.105.895-2 2-2v14zM22 4v12c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2V4c0-1.105.895-2 2-2h12c1.105 0 2 .895 2 2zM8 4v6.333L11 7l4.855 5.395.656-.73c.796-.886 2.183-.886 2.977 0l.513.57V4H8z"/></g></svg>;
				break;
			case 'gridicons-image':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M13 9.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5zM22 6v12c0 1.105-.895 2-2 2H4c-1.105 0-2-.895-2-2V6c0-1.105.895-2 2-2h16c1.105 0 2 .895 2 2zm-2 0H4v7.444L8 9l5.895 6.55 1.587-1.85c.798-.932 2.24-.932 3.037 0L20 15.426V6z"/></g></svg>;
				break;
			case 'gridicons-indent-left':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 20h2V4h-2v16zM2 11h10.172l-2.086-2.086L11.5 7.5 16 12l-4.5 4.5-1.414-1.414L12.172 13H2v-2z"/></g></svg>;
				break;
			case 'gridicons-indent-right':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M6 4H4v16h2V4zm16 9H11.828l2.086 2.086L12.5 16.5 8 12l4.5-4.5 1.414 1.414L11.828 11H22v2z"/></g></svg>;
				break;
			case 'gridicons-info-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M13 9h-2V7h2v2zm0 2h-2v6h2v-6zm-1-7c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8m0-2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/></g></svg>;
				break;
			case 'gridicons-info':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></g></svg>;
				break;
			case 'gridicons-ink':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M5 15c0 3.866 3.134 7 7 7s7-3.134 7-7c0-1.387-.41-2.677-1.105-3.765h.007L12 2l-5.903 9.235h.007C5.41 12.323 5 13.613 5 15z"/></g></svg>;
				break;
			case 'gridicons-institution':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M2 19h20v3H2zM12 2L2 6v2h20V6M17 10h3v7h-3zM10.5 10h3v7h-3zM4 10h3v7H4z"/></g></svg>;
				break;
			case 'gridicons-italic':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M10.536 5l-.427 2h1.5L9.262 18h-1.5l-.427 2h6.128l.426-2h-1.5l2.347-11h1.5l.427-2"/></g></svg>;
				break;
			case 'gridicons-layout-blocks':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 7h-2V3c0-1.105-.895-2-2-2H7c-1.105 0-2 .895-2 2v2H3c-1.105 0-2 .895-2 2v4c0 1.105.895 2 2 2h2v8c0 1.105.895 2 2 2h10c1.105 0 2-.895 2-2v-2h2c1.105 0 2-.895 2-2V9c0-1.105-.895-2-2-2zm-4 14H7v-8h2c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2H7V3h10v4h-2c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h2v2zm4-4h-6V9h6v8z"/></g></svg>;
				break;
			case 'gridicons-layout':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M8 20H5c-1.105 0-2-.895-2-2V6c0-1.105.895-2 2-2h3c1.105 0 2 .895 2 2v12c0 1.105-.895 2-2 2zm8-10h4c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2h-4c-1.105 0-2 .895-2 2v3c0 1.105.895 2 2 2zm5 10v-6c0-1.105-.895-2-2-2h-5c-1.105 0-2 .895-2 2v6c0 1.105.895 2 2 2h5c1.105 0 2-.895 2-2z"/></g></svg>;
				break;
			case 'gridicons-link-break':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M10 11l-2 2H7v-2h3zm9.64-3.64L22 5l-1.5-1.5-17 17L5 22l9-9h3v-2h-1l2-2c1.103 0 2 .897 2 2v2c0 1.103-.897 2-2 2h-4.977c.913 1.208 2.347 2 3.977 2h1c2.21 0 4-1.79 4-4v-2c0-1.623-.97-3.013-2.36-3.64zM4.36 16.64L6 15c-1.103 0-2-.897-2-2v-2c0-1.103.897-2 2-2h4.977C10.065 7.792 8.63 7 7 7H6c-2.21 0-4 1.79-4 4v2c0 1.623.97 3.013 2.36 3.64z"/></g></svg>;
				break;
			case 'gridicons-link':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 13H7v-2h10v2zm1-6h-1c-1.63 0-3.065.792-3.977 2H18c1.103 0 2 .897 2 2v2c0 1.103-.897 2-2 2h-4.977c.913 1.208 2.347 2 3.977 2h1c2.21 0 4-1.79 4-4v-2c0-2.21-1.79-4-4-4zM2 11v2c0 2.21 1.79 4 4 4h1c1.63 0 3.065-.792 3.977-2H6c-1.103 0-2-.897-2-2v-2c0-1.103.897-2 2-2h4.977C10.065 7.792 8.63 7 7 7H6c-2.21 0-4 1.79-4 4z"/></g></svg>;
				break;
			case 'gridicons-list-checkmark':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9.5 15.5L5 20l-2.5-2.5 1.06-1.06L5 17.88l3.44-3.44L9.5 15.5zM10 5v2h11V5H10zm0 14h11v-2H10v2zm0-6h11v-2H10v2zM8.44 8.44L5 11.88l-1.44-1.44L2.5 11.5 5 14l4.5-4.5-1.06-1.06zm0-6L5 5.88 3.56 4.44 2.5 5.5 5 8l4.5-4.5-1.06-1.06z"/></g></svg>;
				break;
			case 'gridicons-list-ordered':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M8 19h13v-2H8v2zm0-6h13v-2H8v2zm0-8v2h13V5H8zm-4.425.252c.107-.096.197-.188.27-.275-.013.228-.02.48-.02.756V8h1.176V3.717H3.96L2.487 4.915l.6.738.487-.4zm.334 7.764c.474-.426.784-.715.93-.867.145-.153.26-.298.35-.436.087-.138.152-.278.194-.42.042-.143.063-.298.063-.466 0-.225-.06-.427-.18-.608s-.29-.32-.507-.417c-.218-.1-.465-.148-.742-.148-.22 0-.42.022-.596.067s-.34.11-.49.195c-.15.085-.337.226-.558.423l.636.744c.174-.15.33-.264.467-.34.138-.078.274-.117.41-.117.13 0 .232.032.304.097.073.064.11.152.11.264 0 .09-.02.176-.055.258-.036.082-.1.18-.192.294-.092.114-.287.328-.586.64L2.42 13.238V14h3.11v-.955H3.91v-.03zm.53 4.746v-.018c.306-.086.54-.225.702-.414.162-.19.243-.42.243-.685 0-.31-.126-.55-.378-.727-.252-.176-.6-.264-1.043-.264-.307 0-.58.033-.816.1s-.47.178-.696.334l.48.773c.293-.183.576-.274.85-.274.147 0 .263.027.35.082s.13.14.13.252c0 .3-.294.45-.882.45h-.27v.87h.264c.217 0 .393.017.527.05.136.03.233.08.294.143.06.064.09.154.09.27 0 .153-.057.265-.173.337-.115.07-.3.106-.554.106-.164 0-.343-.022-.538-.07-.194-.044-.385-.115-.573-.21v.96c.228.088.44.148.637.182.196.033.41.05.64.05.56 0 .998-.114 1.314-.343.315-.228.473-.542.473-.94.002-.585-.356-.923-1.07-1.013z"/></g></svg>;
				break;
			case 'gridicons-list-unordered':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9 19h12v-2H9v2zm0-6h12v-2H9v2zm0-8v2h12V5H9zm-4-.5c-.828 0-1.5.672-1.5 1.5S4.172 7.5 5 7.5 6.5 6.828 6.5 6 5.828 4.5 5 4.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"/></g></svg>;
				break;
			case 'gridicons-location':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19 9c0-3.866-3.134-7-7-7S5 5.134 5 9c0 1.387.41 2.677 1.105 3.765h-.008C8.457 16.46 12 22 12 22l5.903-9.235h-.007C18.59 11.677 19 10.387 19 9zm-7 3c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></g></svg>;
				break;
			case 'gridicons-lock':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V10c0-1.105-.895-2-2-2zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9V7zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723 0-1.105.895-2 2-2s2 .895 2 2c0 .738-.405 1.376-1 1.723z"/></g></svg>;
				break;
			case 'gridicons-mail':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 4H4c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zm0 4.236l-8 4.882-8-4.882V6h16v2.236z"/></g></svg>;
				break;
			case 'gridicons-mention':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10v-2c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8v.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.65 0 3.102-.81 4.013-2.043C16.648 15.6 17.527 16 18.5 16c1.93 0 3.5-1.57 3.5-3.5V12c0-5.523-4.477-10-10-10zm0 13c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z"/></g></svg>;
				break;
			case 'gridicons-menu':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 6v2H3V6h18zM3 18h18v-2H3v2zm0-5h18v-2H3v2z"/></g></svg>;
				break;
			case 'gridicons-menus':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9 19h10v-2H9v2zm0-6h6v-2H9v2zm0-8v2h12V5H9zm-4-.5c-.828 0-1.5.672-1.5 1.5S4.172 7.5 5 7.5 6.5 6.828 6.5 6 5.828 4.5 5 4.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"/></g></svg>;
				break;
			case 'gridicons-microphone':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 13c1.104 0 2-.896 2-2V6c0-1.104-.896-2-2-2-1.105 0-2 .896-2 2v5c0 1.104.895 2 2 2zm4-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6c0 2.972 2.164 5.433 5 5.91V20h2v-3.09c2.836-.478 5-2.94 5-5.91h-2z"/></g></svg>;
				break;
			case 'gridicons-minus-small':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M6 11h12v2H6z"/></g></svg>;
				break;
			case 'gridicons-minus':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 11h18v2H3z"/></g></svg>;
				break;
			case 'gridicons-money':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M2 5v14h20V5H2zm5 12c0-1.657-1.343-3-3-3v-4c1.657 0 3-1.343 3-3h10c0 1.657 1.343 3 3 3v4c-1.657 0-3 1.343-3 3H7zm5-8c1.1 0 2 1.3 2 3s-.9 3-2 3-2-1.3-2-3 .9-3 2-3z"/></g></svg>;
				break;
			case 'gridicons-my-sites-horizon':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M10.986 13.928l.762-2.284-1.324-3.63c-.458-.026-.892-.08-.892-.08-.458-.027-.405-.727.054-.7 0 0 1.403.107 2.24.107.888 0 2.265-.107 2.265-.107.46-.027.513.646.055.7 0 0-.46.055-.973.082l2.006 5.966c-.875-.034-1.74-.053-2.6-.06l-.428-1.177-.403 1.17c-.252.002-.508.01-.76.015zm-7.156.393c-.21-.737-.33-1.514-.33-2.32 0-1.232.264-2.402.736-3.46l2.036 5.58c.85-.06 1.69-.104 2.526-.138L6.792 8.015c.512-.027.973-.08.973-.08.458-.055.404-.728-.055-.702 0 0-1.376.108-2.265.108-.16 0-.347-.003-.547-.01C6.418 5.025 9.03 3.5 12 3.5c2.213 0 4.228.846 5.74 2.232-.036-.002-.072-.007-.11-.007-.835 0-1.427.727-1.427 1.51 0 .7.404 1.292.835 1.993.323.566.7 1.293.7 2.344 0 .674-.244 1.463-.572 2.51.3.02.604.043.907.066l.798-2.307c.486-1.212.647-2.18.647-3.043 0-.313-.02-.603-.057-.874.662 1.21 1.04 2.6 1.04 4.077 0 .807-.128 1.58-.34 2.32.5.05 1.006.112 1.51.17.205-.798.33-1.628.33-2.49 0-5.523-4.477-10-10-10S2 6.477 2 12c0 .862.125 1.692.33 2.49.5-.057 1.003-.12 1.5-.17zm14.638 3.168C16.676 19.672 14.118 20.5 12 20.5c-1.876 0-4.55-.697-6.463-3.012-.585.048-1.174.1-1.77.16C5.572 20.272 8.578 22 12 22c3.422 0 6.43-1.73 8.232-4.35-.593-.063-1.18-.114-1.764-.162zM12 15.01c-3.715 0-7.368.266-10.958.733.18.41.35.825.506 1.247 3.427-.43 6.91-.68 10.452-.68s7.025.25 10.452.68c.156-.422.327-.836.506-1.246-3.59-.467-7.243-.734-10.958-.734z"/></g></svg>;
				break;
			case 'gridicons-my-sites':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.5 12c0-1.232.264-2.402.736-3.46L8.29 19.65C5.456 18.272 3.5 15.365 3.5 12zm8.5 8.5c-.834 0-1.64-.12-2.4-.345l2.55-7.41 2.613 7.157c.017.042.038.08.06.117-.884.31-1.833.48-2.823.48zm1.172-12.485c.512-.027.973-.08.973-.08.458-.055.404-.728-.054-.702 0 0-1.376.108-2.265.108-.835 0-2.24-.107-2.24-.107-.458-.026-.51.674-.053.7 0 0 .434.055.892.082l1.324 3.63-1.86 5.578-3.096-9.208c.512-.027.973-.08.973-.08.458-.055.403-.728-.055-.702 0 0-1.376.108-2.265.108-.16 0-.347-.003-.547-.01C6.418 5.025 9.03 3.5 12 3.5c2.213 0 4.228.846 5.74 2.232-.037-.002-.072-.007-.11-.007-.835 0-1.427.727-1.427 1.51 0 .7.404 1.292.835 1.993.323.566.7 1.293.7 2.344 0 .727-.28 1.572-.646 2.748l-.848 2.833-3.072-9.138zm3.1 11.332l2.597-7.506c.484-1.212.645-2.18.645-3.044 0-.313-.02-.603-.057-.874.664 1.21 1.042 2.6 1.042 4.078 0 3.136-1.7 5.874-4.227 7.347z"/></g></svg>;
				break;
			case 'gridicons-not-visible':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M1 12s4.188-6 11-6c.947 0 1.84.12 2.678.322L8.36 12.64C8.133 12.14 8 11.586 8 11c0-.937.335-1.787.875-2.47C6.483 9.344 4.66 10.917 3.62 12c.68.707 1.696 1.62 2.98 2.398L5.15 15.85C2.498 14.13 1 12 1 12zm22 0s-4.188 6-11 6c-.946 0-1.836-.124-2.676-.323L5 22l-1.5-1.5 17-17L22 5l-3.147 3.147C21.5 9.87 23 12 23 12zm-2.615.006c-.678-.708-1.697-1.624-2.987-2.403L16 11c0 2.21-1.79 4-4 4l-.947.947c.31.03.624.053.947.053 3.978 0 6.943-2.478 8.385-3.994z"/></g></svg>;
				break;
			case 'gridicons-notice-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 13h-2v2h2v-2zm-2-2h2l.5-6h-3l.5 6z"/></g></svg>;
				break;
			case 'gridicons-notice':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2l-.5-6h3l-.5 6z"/></g></svg>;
				break;
			case 'gridicons-pages':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 8H8V6h8v2zm0 2H8v2h8v-2zm4-6v12l-6 6H6c-1.105 0-2-.895-2-2V4c0-1.105.895-2 2-2h12c1.105 0 2 .895 2 2zm-2 10V4H6v16h6v-4c0-1.105.895-2 2-2h4z"/></g></svg>;
				break;
			case 'gridicons-pause':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></g></svg>;
				break;
			case 'gridicons-pencil':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M13 6l5 5-9.507 9.507c-.686-.686-.69-1.794-.012-2.485l-.002-.003c-.69.676-1.8.673-2.485-.013-.677-.677-.686-1.762-.036-2.455l-.008-.008c-.694.65-1.78.64-2.456-.036L13 6zm7.586-.414l-2.172-2.172c-.78-.78-2.047-.78-2.828 0L14 5l5 5 1.586-1.586c.78-.78.78-2.047 0-2.828zM3 18v3h3c0-1.657-1.343-3-3-3z"/></g></svg>;
				break;
			case 'gridicons-phone':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 2H8c-1.104 0-2 .896-2 2v16c0 1.104.896 2 2 2h8c1.104 0 2-.896 2-2V4c0-1.104-.896-2-2-2zm-3 19h-2v-1h2v1zm3-2H8V5h8v14z"/></g></svg>;
				break;
			case 'gridicons-plugins':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 8V3c0-.552-.448-1-1-1s-1 .448-1 1v5h-4V3c0-.552-.448-1-1-1s-1 .448-1 1v5H5v4c0 2.79 1.637 5.193 4 6.317V22h6v-3.683c2.363-1.124 4-3.527 4-6.317V8h-3z"/></g></svg>;
				break;
			case 'gridicons-plus-small':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 11h-5V6h-2v5H6v2h5v5h2v-5h5"/></g></svg>;
				break;
			case 'gridicons-plus':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><title>gridicons-plus</title><path d="M21 13h-8v8h-2v-8H3v-2h8V3h2v8h8v2z"/></g></svg>;
				break;
			case 'gridicons-popout':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M6 7V5c0-1.105.895-2 2-2h11c1.105 0 2 .895 2 2v14c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2v-2h2v2h11V5H8v2H6zm5.5-.5l-1.414 1.414L13.172 11H3v2h10.172l-3.086 3.086L11.5 17.5 17 12l-5.5-5.5z"/></g></svg>;
				break;
			case 'gridicons-posts':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 19H3v-2h13v2zm5-10H3v2h18V9zM3 5v2h11V5H3zm14 0v2h4V5h-4zm-6 8v2h10v-2H11zm-8 0v2h5v-2H3z"/></g></svg>;
				break;
			case 'gridicons-print':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9 16h6v2H9v-2zm13 1h-3v3c0 1.105-.895 2-2 2H7c-1.105 0-2-.895-2-2v-3H2V9c0-1.105.895-2 2-2h1V5c0-1.105.895-2 2-2h10c1.105 0 2 .895 2 2v2h1c1.105 0 2 .895 2 2v8zM7 7h10V5H7v2zm10 7H7v6h10v-6zm3-3.5c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5z"/></g></svg>;
				break;
			case 'gridicons-product-downloadable':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 3H2v6h1v11c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V9h1V3zM4 5h16v2H4V5zm15 15H5V9h14v11zm-6-10v5.17l2.59-2.58L17 14l-5 5-5-5 1.41-1.42L11 15.17V10h2z"/></g></svg>;
				break;
			case 'gridicons-product-external':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 3H2v6h1v11c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V9h1V3zM4 5h16v2H4V5zm15 15H5V9h14v11zm-2-9v6h-2v-2.59l-3.29 3.29-1.41-1.41L13.59 13H11v-2h6z"/></g></svg>;
				break;
			case 'gridicons-product-virtual':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 3H2v6h1v11c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V9h1V3zM4 5h16v2H4V5zm15 15H5V9h14v11zM7 16.45c0-1.005.815-1.82 1.82-1.82h.09c-.335-1.59.68-3.148 2.27-3.483s3.148.68 3.483 2.27c.02.097.036.195.046.293 1.252-.025 2.29.97 2.314 2.224.017.868-.462 1.67-1.235 2.066H7.87c-.54-.33-.87-.917-.87-1.55z"/></g></svg>;
				break;
			case 'gridicons-product':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 3H2v6h1v11c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V9h1V3zM4 5h16v2H4V5zm15 15H5V9h14v11zM9 11h6c0 1.105-.895 2-2 2h-2c-1.105 0-2-.895-2-2z"/></g></svg>;
				break;
			case 'gridicons-quote':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.165 1.4.615 2.52 1.35 3.35.732.833 1.646 1.25 2.742 1.25.967 0 1.768-.29 2.402-.876.627-.576.942-1.365.942-2.368v.01z"/></g></svg>;
				break;
			case 'gridicons-read-more':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 5h18v4H3V5zm0 14h18v-4H3v4zm6-6h6v-2H9v2zm-6 0h4v-2H3v2zm14 0h4v-2h-4v2z"/></g></svg>;
				break;
			case 'gridicons-reader-follow':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23 16v2h-3v3h-2v-3h-3v-2h3v-3h2v3h3zM20 2v9h-4v3h-3v4H4c-1.1 0-2-.9-2-2V2h18zM8 13v-1H4v1h4zm3-3H4v1h7v-1zm0-2H4v1h7V8zm7-4H4v2h14V4z"/></g></svg>;
				break;
			case 'gridicons-reader-following':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23 13.482L15.508 21 12 17.4l1.412-1.388 2.106 2.188 6.094-6.094L23 13.482zm-7.455 1.862L20 10.89V2H2v14c0 1.1.9 2 2 2h4.538l4.913-4.832 2.095 2.176zM8 13H4v-1h4v1zm3-2H4v-1h7v1zm0-2H4V8h7v1zm7-3H4V4h14v2z"/></g></svg>;
				break;
			case 'gridicons-reader':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 4v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4H3zm7 11H5v-1h5v1zm2-2H5v-1h7v1zm0-2H5v-1h7v1zm7 4h-5v-5h5v5zm0-7H5V6h14v2z"/></g></svg>;
				break;
			case 'gridicons-reblog':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22.086 9.914L20 7.828V18c0 1.105-.895 2-2 2h-7v-2h7V7.828l-2.086 2.086L14.5 8.5 19 4l4.5 4.5-1.414 1.414zM6 16.172V6h7V4H6c-1.105 0-2 .895-2 2v10.172l-2.086-2.086L.5 15.5 5 20l4.5-4.5-1.414-1.414L6 16.172z"/></g></svg>;
				break;
			case 'gridicons-redo':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 6v3.586L14.343 5.93C13.17 4.756 11.636 4.17 10.1 4.17s-3.07.585-4.242 1.757c-2.343 2.342-2.343 6.14 0 8.484l5.364 5.364 1.414-1.414L7.272 13c-1.56-1.56-1.56-4.097 0-5.657.755-.755 1.76-1.172 2.828-1.172 1.068 0 2.073.417 2.828 1.173L16.586 11H13v2h7V6h-2z"/></g></svg>;
				break;
			case 'gridicons-refresh':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17.91 14c-.478 2.833-2.943 5-5.91 5-3.308 0-6-2.692-6-6s2.692-6 6-6h2.172l-2.086 2.086L13.5 10.5 18 6l-4.5-4.5-1.414 1.414L14.172 5H12c-4.418 0-8 3.582-8 8s3.582 8 8 8c4.08 0 7.438-3.055 7.93-7h-2.02z"/></g></svg>;
				break;
			case 'gridicons-refund':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M13.91 2.91L11.83 5H14c4.418 0 8 3.582 8 8h-2c0-3.314-2.686-6-6-6h-2.17l2.09 2.09-1.42 1.41L8 6l1.41-1.41L12.5 1.5l1.41 1.41zM2 12v10h16V12H2zm2 6.56v-3.11c.6-.35 1.1-.85 1.45-1.45h9.1c.35.6.85 1.1 1.45 1.45v3.11c-.593.35-1.085.845-1.43 1.44H5.45c-.35-.597-.85-1.094-1.45-1.44zm6 .44c.828 0 1.5-.895 1.5-2s-.672-2-1.5-2-1.5.895-1.5 2 .672 2 1.5 2z"/></g></svg>;
				break;
			case 'gridicons-reply':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M14 8H6.828l2.586-2.586L8 4 3 9l5 5 1.414-1.414L6.828 10H14c2.206 0 4 1.794 4 4s-1.794 4-4 4h-2v2h2c3.314 0 6-2.686 6-6s-2.686-6-6-6z"/></g></svg>;
				break;
			case 'gridicons-rotate':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 14v6c0 1.105-.895 2-2 2H6c-1.105 0-2-.895-2-2v-6c0-1.105.895-2 2-2h10c1.105 0 2 .895 2 2zM13.914 2.914L11.828 5H14c4.418 0 8 3.582 8 8h-2c0-3.308-2.692-6-6-6h-2.172l2.086 2.086L12.5 10.5 8 6l1.414-1.414L12.5 1.5l1.414 1.414z"/></g></svg>;
				break;
			case 'gridicons-scheduled':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M10.498 18l-3.705-3.704 1.415-1.415 2.294 2.295 5.293-5.293 1.415 1.415L10.498 18zM21 6v13c0 1.104-.896 2-2 2H5c-1.104 0-2-.896-2-2V6c0-1.104.896-2 2-2h1V2h2v2h8V2h2v2h1c1.104 0 2 .896 2 2zm-2 2H5v11h14V8z"/></g></svg>;
				break;
			case 'gridicons-search':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 19l-5.154-5.154C16.574 12.742 17 11.42 17 10c0-3.866-3.134-7-7-7s-7 3.134-7 7 3.134 7 7 7c1.42 0 2.742-.426 3.846-1.154L19 21l2-2zM5 10c0-2.757 2.243-5 5-5s5 2.243 5 5-2.243 5-5 5-5-2.243-5-5z"/></g></svg>;
				break;
			case 'gridicons-share-ios':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 8h2c1.105 0 2 .895 2 2v9c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2v-9c0-1.105.895-2 2-2h2v2H5v9h14v-9h-2V8zM6.5 5.5l1.414 1.414L11 3.828V14h2V3.828l3.086 3.086L17.5 5.5 12 0 6.5 5.5z"/></g></svg>;
				break;
			case 'gridicons-share':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 16c-.788 0-1.5.31-2.034.807L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.048 4.118c-.053.223-.088.453-.088.692 0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3z"/></g></svg>;
				break;
			case 'gridicons-shipping':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 8h-2V7c0-1.105-.895-2-2-2H4c-1.105 0-2 .895-2 2v10h2c0 1.657 1.343 3 3 3s3-1.343 3-3h4c0 1.657 1.343 3 3 3s3-1.343 3-3h2v-5l-4-4zM7 18.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zM4 14V7h10v7H4zm13 4.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/></g></svg>;
				break;
			case 'gridicons-sign-out':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M16 17v2c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2h9c1.105 0 2 .895 2 2v2h-2V5H5v14h9v-2h2zm2.5-10.5l-1.414 1.414L20.172 11H10v2h10.172l-3.086 3.086L18.5 17.5 24 12l-5.5-5.5z"/></g></svg>;
				break;
			case 'gridicons-spam':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 2H7L2 7v10l5 5h10l5-5V7l-5-5zm-4 15h-2v-2h2v2zm0-4h-2l-.5-6h3l-.5 6z"/></g></svg>;
				break;
			case 'gridicons-speaker':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19 8v6c1.7 0 3-1.3 3-3s-1.3-3-3-3zM11 7H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v3c0 1.1.9 2 2 2h2v-5h2l4 4h2V3h-2l-4 4z"/></g></svg>;
				break;
			case 'gridicons-special-character':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12.005 7.418c-1.237 0-2.19.376-2.86 1.128s-1.005 1.812-1.005 3.18c0 1.387.226 2.513.677 3.377.45.865 1.135 1.543 2.05 2.036V20H5v-2.666h3.12c-1.04-.636-1.842-1.502-2.405-2.6-.564-1.097-.846-2.322-.846-3.676 0-1.258.29-2.363.875-3.317.585-.952 1.417-1.685 2.497-2.198s2.334-.77 3.763-.77c2.18 0 3.915.572 5.204 1.713s1.932 2.673 1.932 4.594c0 1.353-.283 2.57-.852 3.65-.567 1.08-1.38 1.947-2.44 2.603H19V20h-5.908v-2.86c.95-.493 1.65-1.18 2.102-2.062s.677-2.006.677-3.374c0-1.36-.336-2.415-1.01-3.164-.672-.747-1.624-1.122-2.855-1.122z"/></g></svg>;
				break;
			case 'gridicons-star-outline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 6.308l1.176 3.167.347.936.997.042 3.374.14-2.647 2.09-.784.62.27.963.91 3.25-2.813-1.872-.83-.553-.83.552-2.814 1.87.91-3.248.27-.962-.783-.62-2.648-2.092 3.374-.14.996-.04.347-.936L12 6.308M12 2L9.418 8.953 2 9.257l5.822 4.602L5.82 21 12 16.89 18.18 21l-2.002-7.14L22 9.256l-7.418-.305L12 2z"/></g></svg>;
				break;
			case 'gridicons-star':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2l2.582 6.953L22 9.257l-5.822 4.602L18.18 21 12 16.89 5.82 21l2.002-7.14L2 9.256l7.418-.304"/></g></svg>;
				break;
			case 'gridicons-stats-alt':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M21 21H3v-2h18v2zM8 10H4v7h4v-7zm6-7h-4v14h4V3zm6 3h-4v11h4V6z"/></g></svg>;
				break;
			case 'gridicons-stats':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M19 3H5c-1.105 0-2 .895-2 2v14c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2zm0 16H5V5h14v14zM9 17H7v-5h2v5zm4 0h-2V7h2v10zm4 0h-2v-7h2v7z"/></g></svg>;
				break;
			case 'gridicons-status':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM7.55 13c-.02.166-.05.33-.05.5 0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5c0-.17-.032-.334-.05-.5h-8.9zM10 10V8c0-.552-.448-1-1-1s-1 .448-1 1v2c0 .552.448 1 1 1s1-.448 1-1zm6 0V8c0-.552-.448-1-1-1s-1 .448-1 1v2c0 .552.448 1 1 1s1-.448 1-1z"/></g></svg>;
				break;
			case 'gridicons-strikethrough':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M14.348 12H21v2h-4.613c.24.515.368 1.094.368 1.748 0 1.317-.474 2.355-1.423 3.114-.947.76-2.266 1.138-3.956 1.138-1.557 0-2.934-.293-4.132-.878v-2.874c.985.44 1.818.75 2.5.928.682.18 1.306.27 1.872.27.68 0 1.2-.13 1.562-.39.363-.26.545-.644.545-1.158 0-.285-.08-.54-.24-.763-.16-.222-.394-.437-.704-.643-.18-.12-.483-.287-.88-.49H3v-2H14.347zm-3.528-2c-.073-.077-.143-.155-.193-.235-.126-.202-.19-.44-.19-.713 0-.44.157-.795.47-1.068.313-.273.762-.41 1.348-.41.492 0 .993.064 1.502.19.51.127 1.153.35 1.93.67l1-2.405c-.753-.327-1.473-.58-2.16-.76-.69-.18-1.414-.27-2.173-.27-1.544 0-2.753.37-3.628 1.108-.874.738-1.312 1.753-1.312 3.044 0 .302.036.58.088.848h3.318z"/></g></svg>;
				break;
			case 'gridicons-sync':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23.5 13.5l-3.086 3.086L19 18l-4.5-4.5 1.414-1.414L18 14.172V12c0-3.308-2.692-6-6-6V4c4.418 0 8 3.582 8 8v2.172l2.086-2.086L23.5 13.5zM6 12V9.828l2.086 2.086L9.5 10.5 5 6 3.586 7.414.5 10.5l1.414 1.414L4 9.828V12c0 4.418 3.582 8 8 8v-2c-3.308 0-6-2.692-6-6z"/></g></svg>;
				break;
			case 'gridicons-tablet':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 2H6c-1.104 0-2 .896-2 2v16c0 1.104.896 2 2 2h12c1.104 0 2-.896 2-2V4c0-1.104-.896-2-2-2zm-5 19h-2v-1h2v1zm5-2H6V5h12v14z"/></g></svg>;
				break;
			case 'gridicons-tag':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 2.007h-7.087c-.53 0-1.04.21-1.414.586L2.592 11.5c-.78.78-.78 2.046 0 2.827l7.086 7.086c.78.78 2.046.78 2.827 0l8.906-8.906c.376-.374.587-.883.587-1.413V4.007c0-1.105-.895-2-2-2zM17.007 9c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/></g></svg>;
				break;
			case 'gridicons-text-color':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M3 19h18v3H3v-3zM15.82 17h3.424L14 3h-4L4.756 17H8.18l1.067-3.5h5.506L15.82 17zm-1.952-6h-3.73l1.868-5.725L13.868 11z"/></g></svg>;
				break;
			case 'gridicons-themes':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 6c-1.105 0-2 .895-2 2v12c0 1.1.9 2 2 2h12c1.105 0 2-.895 2-2H4V6zm16-4H8c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2zm-5 14H8V9h7v7zm5 0h-3V9h3v7zm0-9H8V4h12v3z"/></g></svg>;
				break;
			case 'gridicons-thumbs-up':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M6.7 22H2v-9h2l2.7 9zM20 9h-6V5c0-1.657-1.343-3-3-3h-1v4L7.1 9.625c-.712.89-1.1 1.996-1.1 3.135V14l2.1 7h8.337c1.836 0 3.435-1.25 3.88-3.03l1.622-6.485C22.254 10.223 21.3 9 20 9z"/></g></svg>;
				break;
			case 'gridicons-time':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 13.4L13 11.667V7h-2v5.333l3.2 4.266 1.6-1.2z"/></g></svg>;
				break;
			case 'gridicons-trash':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M6.187 8h11.625l-.695 11.125C17.05 20.18 16.177 21 15.12 21H8.88c-1.057 0-1.93-.82-1.997-1.875L6.187 8zM19 5v2H5V5h3V4c0-1.105.895-2 2-2h4c1.105 0 2 .895 2 2v1h3zm-9 0h4V4h-4v1z"/></g></svg>;
				break;
			case 'gridicons-trophy':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18 5.062V3H6v2.062H2V8c0 2.525 1.89 4.598 4.324 4.932.7 2.058 2.485 3.61 4.676 3.978V18c0 1.105-.895 2-2 2H8v2h8v-2h-1c-1.105 0-2-.895-2-2v-1.09c2.19-.368 3.976-1.92 4.676-3.978C20.11 12.598 22 10.525 22 8V5.062h-4zM4 8v-.938h2v3.766C4.836 10.416 4 9.304 4 8zm16 0c0 1.304-.836 2.416-2 2.83V7.06h2V8z"/></g></svg>;
				break;
			case 'gridicons-types':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M22 17c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5 5 2.24 5 5zM6.5 6.5h3.8L7 1 1 11h5.5V6.5zm9.5 4.085V8H8v8h2.585c.433-2.783 2.632-4.982 5.415-5.415z"/></g></svg>;
				break;
			case 'gridicons-underline':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M4 19v2h16v-2H4zM18 3v8c0 3.314-2.686 6-6 6s-6-2.686-6-6V3h3v8c0 1.654 1.346 3 3 3s3-1.346 3-3V3h3z"/></g></svg>;
				break;
			case 'gridicons-undo':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M18.142 5.93C16.97 4.756 15.435 4.17 13.9 4.17s-3.072.586-4.244 1.757L6 9.585V6H4v7h7v-2H7.414l3.657-3.657c.756-.755 1.76-1.172 2.83-1.172 1.067 0 2.072.417 2.827 1.173 1.56 1.56 1.56 4.097 0 5.657l-5.364 5.364 1.414 1.414 5.364-5.364c2.345-2.343 2.345-6.142.002-8.485z"/></g></svg>;
				break;
			case 'gridicons-user-circle':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18.5c-4.694 0-8.5-3.806-8.5-8.5S7.306 3.5 12 3.5s8.5 3.806 8.5 8.5-3.806 8.5-8.5 8.5zm0-8c-3.038 0-5.5 1.728-5.5 3.5s2.462 3.5 5.5 3.5 5.5-1.728 5.5-3.5-2.462-3.5-5.5-3.5zm0-.5c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/></g></svg>;
				break;
			case 'gridicons-user':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 16s8 0 8-2c0-2.4-3.9-5-8-5s-8 2.6-8 5c0 2 8 2 8 2z"/></g></svg>;
				break;
			case 'gridicons-video-camera':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17 9V7c0-1.105-.895-2-2-2H4c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h11c1.105 0 2-.895 2-2v-2l5 4V5l-5 4z"/></g></svg>;
				break;
			case 'gridicons-video':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M20 4v2h-2V4H6v2H4V4c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2v-2h2v2h12v-2h2v2c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zM6 16H4v-3h2v3zm0-5H4V8h2v3zm4 4V9l4.5 3-4.5 3zm10 1h-2v-3h2v3zm0-5h-2V8h2v3z"/></g></svg>;
				break;
			case 'gridicons-visible':
				svg = <svg className={ iconClass } height={ this.props.size } width={ this.props.size } onClick={ this.props.onClick } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 6C5.188 6 1 12 1 12s4.188 6 11 6 11-6 11-6-4.188-6-11-6zm0 10c-3.943 0-6.926-2.484-8.38-4 1.04-1.085 2.863-2.657 5.255-3.47C8.335 9.214 8 10.064 8 11c0 2.21 1.79 4 4 4s4-1.79 4-4c0-.937-.335-1.787-.875-2.47 2.393.813 4.216 2.386 5.254 3.47-1.456 1.518-4.438 4-8.38 4z"/></g></svg>;
				break;
		}

		return ( svg );
	}
} );

module.exports = Gridicon;
