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
		onClick: PropTypes.func,
		isJetpack: PropTypes.bool
	},

	getDefaultProps() {
		return {
			count: 0,
			onClick: () => {},
			isJetpack: false
		};
	},

	render() {
		const { count, isJetpack, onClick } = this.props;

		return (
			<Button
				compact borderless
				className="drafts-button"
				onClick={ onClick }
				disabled={ ! count && ! isJetpack }
				aria-label={ this.translate( 'View all drafts' ) }
			>
				<span>{ this.translate( 'Drafts' ) }</span>
				{ count && ! isJetpack ? <Count count={ count } /> : null }
			</Button>
		);
	}
} );
