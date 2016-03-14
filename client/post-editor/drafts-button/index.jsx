/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';

export default React.createClass( {
	displayName: 'EditorDraftsButton',

	propTypes: {
		count: PropTypes.number,
		onClick: PropTypes.func
	},

	getDefaultProps() {
		return {
			count: 0,
			onClick: () => {}
		};
	},

	render() {
		return (
			<Button
				compact borderless
				className="drafts-button"
				onClick={ this.props.onClick }
				disabled={ ! this.props.count }
				aria-label={ this.translate( 'View all drafts' ) }
			>
				<span>{ this.translate( 'Drafts' ) }</span>
				{ this.props.count ? <Count count={ this.props.count } /> : null }
			</Button>
		);
	}
} );
