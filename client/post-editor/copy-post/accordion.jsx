/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Gridicon from 'components/gridicon';

module.exports = React.createClass( {
	displayName: 'EditorCopyPost',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
	},

	getTitle: function() {
		return this.translate( 'Copy Post' );
	},

	getSubtitle: function() {
		return this.translate( 'Use a previous post as a template' );
	},

	render: function() {
		const classes = classNames( 'editor-drawer__accordion' );
		return (
			<Accordion
				title={ this.getTitle() }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="aside" /> }
				className={ classes }
			>
				TEST
			</Accordion>
		);
	},
} );
