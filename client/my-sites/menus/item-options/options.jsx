/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var getContentTitle = require( '../menu-utils' ).getContentTitle;

/**
 * Component
 */
var Options = React.createClass( {
	propTypes: {
		item: React.PropTypes.object.isRequired,
		options: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func.isRequired
	},

	renderItemTags: function ( tags ) {
		var tagElements;
		if ( tags && tags.length ) {
			tagElements = tags.map( function ( tag ) {
				return <span className="menu-item-tag" key={ tag }>{ tag }</span>;
			} );
			return <span className="menu-item-tag-container">{ tagElements }</span>;
		}
	},

	renderItem: function( item ) {
		var checked = ( item.ID === this.props.item.content_id ) &&
			( this.props.itemType.name === this.props.item.type ),
			isPrivate = item.status && item.status === 'private';
		return (
			<li key={ this.props.itemType.name + '-' + item.ID } className={ isPrivate ? 'option-is-private' : '' } >
				<div>
					<input id={ "option-" + item.ID } type='radio' name='radios' value={ item.ID }
						onChange={ this.props.onChange.bind( null, item ) }
						checked={ checked }
					/>
					<label htmlFor={ "option-" + item.ID }>{ getContentTitle( item ) }</label>
					{ this.renderItemTags(item.tags) }
				</div>
				{ item.items ? this.renderHierarchy( item.items, true ) : null }
			</li>
		);
	},

	renderHierarchy: function( items, isRecursive ) {
		var depth = isRecursive ? '' : 'depth-0';
		return <ul className={ depth }>{ items.map( this.renderItem, this ) }</ul>;
	},

	render: function() {
		return this.renderHierarchy( this.props.options );
	}
} );

module.exports = Options;
