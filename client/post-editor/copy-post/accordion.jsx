/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
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

	getDescription: function() {
		return this.translate( 'Use an existing post as a template.' );
	},

	render: function() {
		const classes = classNames( 'editor-drawer__accordion' );
		return (
			<Accordion
				title={ this.getTitle() }
				icon={ <Gridicon icon="aside" /> }
				className={ classes }
			>
				<AccordionSection>
					<p className="editor-drawer__description">
						{ this.getDescription() }
					</p>
				</AccordionSection>
			</Accordion>
		);
	},
} );
