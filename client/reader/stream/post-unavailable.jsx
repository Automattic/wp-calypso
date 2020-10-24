/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import config from 'calypso/config';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

class PostUnavailable extends React.PureComponent {
	componentDidMount() {
		this.errors = {
			unauthorized: this.props.translate(
				'This is a post on a private site that you’re following, but not currently a member of.' +
					' ' +
					'Please request membership to display these posts in Reader.'
			),
			default: this.props.translate( 'An error occurred loading this post.' ),
		};
	}

	render() {
		const errorMessage =
			this.errors[ this.props.post.errorCode || 'default' ] || this.errors.default;

		if ( this.props.post.statusCode === 404 ) {
			// don't render a card for 404s. These are posts that we once had but were deleted.
			return null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card tagName="article" className="reader__card is-error">
				<div className="reader__post-header">
					<h1 className="reader__post-title">
						<div className="reader__post-title-link">
							<span className="reader__placeholder-text">Oops!</span>
						</div>
					</h1>
				</div>

				<div className="reader__post-excerpt">
					<p>{ errorMessage }</p>
					{ config.isEnabled( 'reader/full-errors' ) ? (
						<pre>{ JSON.stringify( this.props.post, null, '  ' ) }</pre>
					) : null }
				</div>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( PostUnavailable );
