/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SectionHeader from 'components/section-header';

class PostCard extends Component {

	handleRemove = () => {
		this.props.remove( this.props.cardIdx );
	}

	handleMouseDown = ( event ) => {
		event.stopPropagation();
		event.preventDefault();
	}

	render() {
		const {
			translate,
			post: {
				ID,
				URL,
				site_ID,
				title,
				slug,
			}
		} = this.props;

		return (
			<SectionHeader key={ slug } label={ title } className="zone__list-item">
				<Button
					compact
					onMouseDown={ this.handleMouseDown }
					href={ URL }
					target="_blank"
					rel="noopener noreferrer">
					{ translate( 'View' ) }
				</Button>
				<Button
					compact
					onMouseDown={ this.handleMouseDown }
					href={ `/post/${ site_ID }/${ ID }` }
					target="_blank"
					rel="noopener noreferrer">
					{ translate( 'Edit' ) }
				</Button>
				<Button
					compact
					scary
					onMouseDown={ this.handleMouseDown }
					onClick={ this.handleRemove }>
					{ translate( 'Remove' ) }
				</Button>
			</SectionHeader>
		);
	}
}

export default localize( PostCard );
