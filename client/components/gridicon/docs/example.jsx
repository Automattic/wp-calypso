/* eslint-disable no-alert */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'Gridicons',

	handleClick: function( icon ) {
		var toCopy = '<Gridicon icon="' + icon + '" />';
		window.prompt( 'Copy component code:', toCopy );
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2><a href="/devdocs/design/gridicons">Gridicons</a></h2>
				<Gridicon icon="add-image" size={ 48 } onClick={ this.handleClick.bind( this, 'add-image' ) } />
				<Gridicon icon="add-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'add-outline' ) } />
				<Gridicon icon="add" size={ 48 } onClick={ this.handleClick.bind( this, 'add' ) } />
				<Gridicon icon="align-center" size={ 48 } onClick={ this.handleClick.bind( this, 'align-center' ) } />
				<Gridicon icon="align-image-center" size={ 48 } onClick={ this.handleClick.bind( this, 'align-image-center' ) } />
				<Gridicon icon="align-image-left" size={ 48 } onClick={ this.handleClick.bind( this, 'align-image-left' ) } />
				<Gridicon icon="align-image-none" size={ 48 } onClick={ this.handleClick.bind( this, 'align-image-none' ) } />
				<Gridicon icon="align-image-right" size={ 48 } onClick={ this.handleClick.bind( this, 'align-image-right' ) } />
				<Gridicon icon="align-justify" size={ 48 } onClick={ this.handleClick.bind( this, 'align-justify' ) } />
				<Gridicon icon="align-left" size={ 48 } onClick={ this.handleClick.bind( this, 'align-left' ) } />
				<Gridicon icon="align-right" size={ 48 } onClick={ this.handleClick.bind( this, 'align-right' ) } />
				<Gridicon icon="arrow-down" size={ 48 } onClick={ this.handleClick.bind( this, 'arrow-down' ) } />
				<Gridicon icon="arrow-left" size={ 48 } onClick={ this.handleClick.bind( this, 'arrow-left' ) } />
				<Gridicon icon="arrow-right" size={ 48 } onClick={ this.handleClick.bind( this, 'arrow-right' ) } />
				<Gridicon icon="arrow-up" size={ 48 } onClick={ this.handleClick.bind( this, 'arrow-up' ) } />
				<Gridicon icon="aside" size={ 48 } onClick={ this.handleClick.bind( this, 'aside' ) } />
				<Gridicon icon="attachment" size={ 48 } onClick={ this.handleClick.bind( this, 'attachment' ) } />
				<Gridicon icon="audio" size={ 48 } onClick={ this.handleClick.bind( this, 'audio' ) } />
				<Gridicon icon="bell" size={ 48 } onClick={ this.handleClick.bind( this, 'bell' ) } />
				<Gridicon icon="block" size={ 48 } onClick={ this.handleClick.bind( this, 'block' ) } />
				<Gridicon icon="bold" size={ 48 } onClick={ this.handleClick.bind( this, 'bold' ) } />
				<Gridicon icon="book" size={ 48 } onClick={ this.handleClick.bind( this, 'book' ) } />
				<Gridicon icon="bookmark-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'bookmark-outline' ) } />
				<Gridicon icon="bookmark" size={ 48 } onClick={ this.handleClick.bind( this, 'bookmark' ) } />
				<Gridicon icon="briefcase" size={ 48 } onClick={ this.handleClick.bind( this, 'briefcase' ) } />
				<Gridicon icon="calendar" size={ 48 } onClick={ this.handleClick.bind( this, 'calendar' ) } />
				<Gridicon icon="camera" size={ 48 } onClick={ this.handleClick.bind( this, 'camera' ) } />
				<Gridicon icon="caption" size={ 48 } onClick={ this.handleClick.bind( this, 'caption' ) } />
				<Gridicon icon="cart" size={ 48 } onClick={ this.handleClick.bind( this, 'cart' ) } />
				<Gridicon icon="checkmark-circle" size={ 48 } onClick={ this.handleClick.bind( this, 'checkmark-circle' ) } />
				<Gridicon icon="checkmark" size={ 48 } onClick={ this.handleClick.bind( this, 'checkmark' ) } />
				<Gridicon icon="chevron-down" size={ 48 } onClick={ this.handleClick.bind( this, 'chevron-down' ) } />
				<Gridicon icon="chevron-left" size={ 48 } onClick={ this.handleClick.bind( this, 'chevron-left' ) } />
				<Gridicon icon="chevron-right" size={ 48 } onClick={ this.handleClick.bind( this, 'chevron-right' ) } />
				<Gridicon icon="chevron-up" size={ 48 } onClick={ this.handleClick.bind( this, 'chevron-up' ) } />
				<Gridicon icon="clear-formatting" size={ 48 } onClick={ this.handleClick.bind( this, 'clear-formatting' ) } />
				<Gridicon icon="clipboard" size={ 48 } onClick={ this.handleClick.bind( this, 'clipboard' ) } />
				<Gridicon icon="cloud-download" size={ 48 } onClick={ this.handleClick.bind( this, 'cloud-download' ) } />
				<Gridicon icon="cloud-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'cloud-outline' ) } />
				<Gridicon icon="cloud-upload" size={ 48 } onClick={ this.handleClick.bind( this, 'cloud-upload' ) } />
				<Gridicon icon="cloud" size={ 48 } onClick={ this.handleClick.bind( this, 'cloud' ) } />
				<Gridicon icon="code" size={ 48 } onClick={ this.handleClick.bind( this, 'code' ) } />
				<Gridicon icon="cog" size={ 48 } onClick={ this.handleClick.bind( this, 'cog' ) } />
				<Gridicon icon="comment" size={ 48 } onClick={ this.handleClick.bind( this, 'comment' ) } />
				<Gridicon icon="computer" size={ 48 } onClick={ this.handleClick.bind( this, 'computer' ) } />
				<Gridicon icon="coupon" size={ 48 } onClick={ this.handleClick.bind( this, 'coupon' ) } />
				<Gridicon icon="create" size={ 48 } onClick={ this.handleClick.bind( this, 'create' ) } />
				<Gridicon icon="credit-card" size={ 48 } onClick={ this.handleClick.bind( this, 'credit-card' ) } />
				<Gridicon icon="crop" size={ 48 } onClick={ this.handleClick.bind( this, 'crop' ) } />
				<Gridicon icon="cross-circle" size={ 48 } onClick={ this.handleClick.bind( this, 'cross-circle' ) } />
				<Gridicon icon="cross-small" size={ 48 } onClick={ this.handleClick.bind( this, 'cross-small' ) } />
				<Gridicon icon="cross" size={ 48 } onClick={ this.handleClick.bind( this, 'cross' ) } />
				<Gridicon icon="custom-post-type" size={ 48 } onClick={ this.handleClick.bind( this, 'custom-post-type' ) } />
				<Gridicon icon="customize" size={ 48 } onClick={ this.handleClick.bind( this, 'customize' ) } />
				<Gridicon icon="domains" size={ 48 } onClick={ this.handleClick.bind( this, 'domains' ) } />
				<Gridicon icon="dropdown" size={ 48 } onClick={ this.handleClick.bind( this, 'dropdown' ) } />
				<Gridicon icon="ellipsis-circle" size={ 48 } onClick={ this.handleClick.bind( this, 'ellipsis-circle' ) } />
				<Gridicon icon="ellipsis" size={ 48 } onClick={ this.handleClick.bind( this, 'ellipsis' ) } />
				<Gridicon icon="external" size={ 48 } onClick={ this.handleClick.bind( this, 'external' ) } />
				<Gridicon icon="flag" size={ 48 } onClick={ this.handleClick.bind( this, 'flag' ) } />
				<Gridicon icon="flip-horizontal" size={ 48 } onClick={ this.handleClick.bind( this, 'flip-horizontal' ) } />
				<Gridicon icon="flip-vertical" size={ 48 } onClick={ this.handleClick.bind( this, 'flip-vertical' ) } />
				<Gridicon icon="folder-multiple" size={ 48 } onClick={ this.handleClick.bind( this, 'folder-multiple' ) } />
				<Gridicon icon="folder" size={ 48 } onClick={ this.handleClick.bind( this, 'folder' ) } />
				<Gridicon icon="globe" size={ 48 } onClick={ this.handleClick.bind( this, 'globe' ) } />
				<Gridicon icon="grid" size={ 48 } onClick={ this.handleClick.bind( this, 'grid' ) } />
				<Gridicon icon="heading" size={ 48 } onClick={ this.handleClick.bind( this, 'heading' ) } />
				<Gridicon icon="heart-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'heart-outline' ) } />
				<Gridicon icon="heart" size={ 48 } onClick={ this.handleClick.bind( this, 'heart' ) } />
				<Gridicon icon="help-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'help-outline' ) } />
				<Gridicon icon="help" size={ 48 } onClick={ this.handleClick.bind( this, 'help' ) } />
				<Gridicon icon="history" size={ 48 } onClick={ this.handleClick.bind( this, 'history' ) } />
				<Gridicon icon="house" size={ 48 } onClick={ this.handleClick.bind( this, 'house' ) } />
				<Gridicon icon="image-multiple" size={ 48 } onClick={ this.handleClick.bind( this, 'image-multiple' ) } />
				<Gridicon icon="image" size={ 48 } onClick={ this.handleClick.bind( this, 'image' ) } />
				<Gridicon icon="indent-left" size={ 48 } onClick={ this.handleClick.bind( this, 'indent-left' ) } />
				<Gridicon icon="indent-right" size={ 48 } onClick={ this.handleClick.bind( this, 'indent-right' ) } />
				<Gridicon icon="info-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'info-outline' ) } />
				<Gridicon icon="info" size={ 48 } onClick={ this.handleClick.bind( this, 'info' ) } />
				<Gridicon icon="ink" size={ 48 } onClick={ this.handleClick.bind( this, 'ink' ) } />
				<Gridicon icon="institution" size={ 48 } onClick={ this.handleClick.bind( this, 'institution' ) } />
				<Gridicon icon="italic" size={ 48 } onClick={ this.handleClick.bind( this, 'italic' ) } />
				<Gridicon icon="layout-blocks" size={ 48 } onClick={ this.handleClick.bind( this, 'layout-blocks' ) } />
				<Gridicon icon="layout" size={ 48 } onClick={ this.handleClick.bind( this, 'layout' ) } />
				<Gridicon icon="link-break" size={ 48 } onClick={ this.handleClick.bind( this, 'link-break' ) } />
				<Gridicon icon="link" size={ 48 } onClick={ this.handleClick.bind( this, 'link' ) } />
				<Gridicon icon="list-checkmark" size={ 48 } onClick={ this.handleClick.bind( this, 'list-checkmark' ) } />
				<Gridicon icon="list-ordered" size={ 48 } onClick={ this.handleClick.bind( this, 'list-ordered' ) } />
				<Gridicon icon="list-unordered" size={ 48 } onClick={ this.handleClick.bind( this, 'list-unordered' ) } />
				<Gridicon icon="location" size={ 48 } onClick={ this.handleClick.bind( this, 'location' ) } />
				<Gridicon icon="lock" size={ 48 } onClick={ this.handleClick.bind( this, 'lock' ) } />
				<Gridicon icon="mail" size={ 48 } onClick={ this.handleClick.bind( this, 'mail' ) } />
				<Gridicon icon="mention" size={ 48 } onClick={ this.handleClick.bind( this, 'mention' ) } />
				<Gridicon icon="menu" size={ 48 } onClick={ this.handleClick.bind( this, 'menu' ) } />
				<Gridicon icon="menus" size={ 48 } onClick={ this.handleClick.bind( this, 'menus' ) } />
				<Gridicon icon="microphone" size={ 48 } onClick={ this.handleClick.bind( this, 'microphone' ) } />
				<Gridicon icon="minus-small" size={ 48 } onClick={ this.handleClick.bind( this, 'minus-small' ) } />
				<Gridicon icon="minus" size={ 48 } onClick={ this.handleClick.bind( this, 'minus' ) } />
				<Gridicon icon="money" size={ 48 } onClick={ this.handleClick.bind( this, 'money' ) } />
				<Gridicon icon="my-sites-horizon" size={ 48 } onClick={ this.handleClick.bind( this, 'my-sites-horizon' ) } />
				<Gridicon icon="my-sites" size={ 48 } onClick={ this.handleClick.bind( this, 'my-sites' ) } />
				<Gridicon icon="not-visible" size={ 48 } onClick={ this.handleClick.bind( this, 'not-visible' ) } />
				<Gridicon icon="notice-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'notice-outline' ) } />
				<Gridicon icon="notice" size={ 48 } onClick={ this.handleClick.bind( this, 'notice' ) } />
				<Gridicon icon="pages" size={ 48 } onClick={ this.handleClick.bind( this, 'pages' ) } />
				<Gridicon icon="pause" size={ 48 } onClick={ this.handleClick.bind( this, 'pause' ) } />
				<Gridicon icon="pencil" size={ 48 } onClick={ this.handleClick.bind( this, 'pencil' ) } />
				<Gridicon icon="phone" size={ 48 } onClick={ this.handleClick.bind( this, 'phone' ) } />
				<Gridicon icon="plugins" size={ 48 } onClick={ this.handleClick.bind( this, 'plugins' ) } />
				<Gridicon icon="plus-small" size={ 48 } onClick={ this.handleClick.bind( this, 'plus-small' ) } />
				<Gridicon icon="plus" size={ 48 } onClick={ this.handleClick.bind( this, 'plus' ) } />
				<Gridicon icon="popout" size={ 48 } onClick={ this.handleClick.bind( this, 'popout' ) } />
				<Gridicon icon="posts" size={ 48 } onClick={ this.handleClick.bind( this, 'posts' ) } />
				<Gridicon icon="print" size={ 48 } onClick={ this.handleClick.bind( this, 'print' ) } />
				<Gridicon icon="product-downloadable" size={ 48 } onClick={ this.handleClick.bind( this, 'product-downloadable' ) } />
				<Gridicon icon="product-external" size={ 48 } onClick={ this.handleClick.bind( this, 'product-external' ) } />
				<Gridicon icon="product-virtual" size={ 48 } onClick={ this.handleClick.bind( this, 'product-virtual' ) } />
				<Gridicon icon="product" size={ 48 } onClick={ this.handleClick.bind( this, 'product' ) } />
				<Gridicon icon="quote" size={ 48 } onClick={ this.handleClick.bind( this, 'quote' ) } />
				<Gridicon icon="read-more" size={ 48 } onClick={ this.handleClick.bind( this, 'read-more' ) } />
				<Gridicon icon="reader-follow" size={ 48 } onClick={ this.handleClick.bind( this, 'reader-follow' ) } />
				<Gridicon icon="reader-following" size={ 48 } onClick={ this.handleClick.bind( this, 'reader-following' ) } />
				<Gridicon icon="reader" size={ 48 } onClick={ this.handleClick.bind( this, 'reader' ) } />
				<Gridicon icon="reblog" size={ 48 } onClick={ this.handleClick.bind( this, 'reblog' ) } />
				<Gridicon icon="redo" size={ 48 } onClick={ this.handleClick.bind( this, 'redo' ) } />
				<Gridicon icon="refresh" size={ 48 } onClick={ this.handleClick.bind( this, 'refresh' ) } />
				<Gridicon icon="refund" size={ 48 } onClick={ this.handleClick.bind( this, 'refund' ) } />
				<Gridicon icon="reply" size={ 48 } onClick={ this.handleClick.bind( this, 'reply' ) } />
				<Gridicon icon="rotate" size={ 48 } onClick={ this.handleClick.bind( this, 'rotate' ) } />
				<Gridicon icon="scheduled" size={ 48 } onClick={ this.handleClick.bind( this, 'scheduled' ) } />
				<Gridicon icon="search" size={ 48 } onClick={ this.handleClick.bind( this, 'search' ) } />
				<Gridicon icon="share-ios" size={ 48 } onClick={ this.handleClick.bind( this, 'share-ios' ) } />
				<Gridicon icon="share" size={ 48 } onClick={ this.handleClick.bind( this, 'share' ) } />
				<Gridicon icon="shipping" size={ 48 } onClick={ this.handleClick.bind( this, 'shipping' ) } />
				<Gridicon icon="sign-out" size={ 48 } onClick={ this.handleClick.bind( this, 'sign-out' ) } />
				<Gridicon icon="spam" size={ 48 } onClick={ this.handleClick.bind( this, 'spam' ) } />
				<Gridicon icon="speaker" size={ 48 } onClick={ this.handleClick.bind( this, 'speaker' ) } />
				<Gridicon icon="special-character" size={ 48 } onClick={ this.handleClick.bind( this, 'special-character' ) } />
				<Gridicon icon="star-outline" size={ 48 } onClick={ this.handleClick.bind( this, 'star-outline' ) } />
				<Gridicon icon="star" size={ 48 } onClick={ this.handleClick.bind( this, 'star' ) } />
				<Gridicon icon="stats-alt" size={ 48 } onClick={ this.handleClick.bind( this, 'stats-alt' ) } />
				<Gridicon icon="stats" size={ 48 } onClick={ this.handleClick.bind( this, 'stats' ) } />
				<Gridicon icon="status" size={ 48 } onClick={ this.handleClick.bind( this, 'status' ) } />
				<Gridicon icon="strikethrough" size={ 48 } onClick={ this.handleClick.bind( this, 'strikethrough' ) } />
				<Gridicon icon="sync" size={ 48 } onClick={ this.handleClick.bind( this, 'sync' ) } />
				<Gridicon icon="tablet" size={ 48 } onClick={ this.handleClick.bind( this, 'tablet' ) } />
				<Gridicon icon="tag" size={ 48 } onClick={ this.handleClick.bind( this, 'tag' ) } />
				<Gridicon icon="text-color" size={ 48 } onClick={ this.handleClick.bind( this, 'text-color' ) } />
				<Gridicon icon="themes" size={ 48 } onClick={ this.handleClick.bind( this, 'themes' ) } />
				<Gridicon icon="thumbs-up" size={ 48 } onClick={ this.handleClick.bind( this, 'thumbs-up' ) } />
				<Gridicon icon="time" size={ 48 } onClick={ this.handleClick.bind( this, 'time' ) } />
				<Gridicon icon="trash" size={ 48 } onClick={ this.handleClick.bind( this, 'trash' ) } />
				<Gridicon icon="trophy" size={ 48 } onClick={ this.handleClick.bind( this, 'trophy' ) } />
				<Gridicon icon="types" size={ 48 } onClick={ this.handleClick.bind( this, 'types' ) } />
				<Gridicon icon="underline" size={ 48 } onClick={ this.handleClick.bind( this, 'underline' ) } />
				<Gridicon icon="undo" size={ 48 } onClick={ this.handleClick.bind( this, 'undo' ) } />
				<Gridicon icon="user-circle" size={ 48 } onClick={ this.handleClick.bind( this, 'user-circle' ) } />
				<Gridicon icon="user" size={ 48 } onClick={ this.handleClick.bind( this, 'user' ) } />
				<Gridicon icon="video-camera" size={ 48 } onClick={ this.handleClick.bind( this, 'video-camera' ) } />
				<Gridicon icon="video" size={ 48 } onClick={ this.handleClick.bind( this, 'video' ) } />
				<Gridicon icon="visible" size={ 48 } onClick={ this.handleClick.bind( this, 'visible' ) } />
			</div>
		);
	}
} );
